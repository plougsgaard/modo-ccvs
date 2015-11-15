import React, { Component } from 'react'
import cheerio from 'cheerio'
import async from 'async'
import _ from 'lodash'
import reqwest from 'reqwest'
import IndexedDBStore from 'idb-wrapper'

import { parseCollection, consolidateCollection } from './service'

var SiteHeader = React.createFactory(require("./views").SiteHeader);
var LoadingScreen = React.createFactory(require("./views").LoadingScreen);
var UploadForm = React.createFactory(require("./views").UploadForm);
var PriceTable = React.createFactory(require("./table").PriceTable);

const SITES = ["special", "standard", "modern_one", "modern_two", "legacy_one", "legacy_two", "vintage", "ignore"]

const loadSite = (site, callback) => {
  reqwest({ url: site }).then((response) => {
    // reqwest is actually inconsistent - sometimes response has a response
    return callback(null, response.response || response)
  })
}

const siteLoaders = _.map(SITES, (site) => (callback) => {
  loadSite(site, callback)
})

class Main extends Component {
  constructor () {
    super()
    this.state = {
      collection: null,
      prices: null,
      nameFilter: '',
      minPriceFilter: null,
      minCountFilter: null,
      store: new IndexedDBStore({
        dbVersion: 1,
        storeName: "modocollection",
        keyPath: "id",
        autoIncrement: true,
        onStoreReady: this.canLoadStore
      }),
      storeLoading: null
    }
  }
  componentWillMount = () => {
    async.parallel(siteLoaders, (err, res) => {
      this.parsePrices(res.join())
    })
  }

  parsePrices = (response) => {
    const q = cheerio.load(response)
    const dirtyPrices = q('dt.priceList-prices-card').map(function () {
      return {
        name: q(this, "a").text(),
        price: parseFloat(q(this).next().text())
      }
    })
    this.setState({
      prices: _.map(dirtyPrices, (p) => ({ name: p.name, price: p.price }))
    }, this.canLoadStore);
  }
  /**
   * Attemps to load from local store once these (2 at the time of writing) conditions are met
   *  - `onStoreReady`: the indexeddb store is ready
   *  - `parsePrices`: the prices has been received from the server
   */
  canLoadStore =
    _.after(_.size(["onStoreReady", "parsePrices"]),
      () => {
        this.state.store.getAll(function (ls) {
          this.setState({
            collection: _.size(ls) > 0 && consolidateCollection(_.last(ls), this.state.prices),
            storeLoading: false
          })
        }.bind(this),
          function (err) {
            console.err(err);
            this.setState({ storeLoading: false });
          }.bind(this));
      })

  handleCollectionLoaded = (userCollectionString) => {
    var c = consolidateCollection(parseCollection(userCollectionString), this.state.prices);
    this.setState({ collection: c });
    this.state.store.clear(function (msg) {
      this.state.store.put(c, function (key) {}, function (err) {});
    }.bind(this));
  }

  clearLocally = () => {
    this.setState({ collection: null });
  }

  clearCollection = (e) => {
    this.state.store.clear(function (msg) {
        this.clearLocally(e);
    }.bind(this))
  }

  /*
   * Forms
   */
  updatePriceFilter = (e) => {
      this.setState({ minPriceFilter: e.target.value });
  }
  updateCountFilter = (e) => {
      this.setState({ minCountFilter: e.target.value });
  }
  updateNameFilter = (e) => {
      this.setState({ nameFilter: e.target.value });
  }

  /*
   * Rendering
   */
  canRender = () => {
      return this.state.collection
          && this.state.prices;
  }
  render = () => {
      if (!this.state.prices) {
          return LoadingScreen({message: "Our monkeys are picking up the prices.."});
      }
      if (this.state.storeLoading) {
          return LoadingScreen({message: "The local store is being prepared.."});
      }
      if (!this.state.collection) {
          return UploadForm({ fileLoadedCallback: this.handleCollectionLoaded });
      }
      if (!this.canRender()) {
          return LoadingScreen({message: "Our monkeys are picking up your collection.."});
      }

      var filters = React.DOM.div({className: "pure-u-lg-1-2 pure-u-1"},
          React.DOM.h3({}, "Filter"),
          React.DOM.form({className: "pure-form pure-form-aligned"},
              React.DOM.div({className: "pure-control-group"},
                  React.DOM.label({forName: "nameFilter"}, "Name"),
                  React.DOM.input({id: "nameFilter", value: this.state.nameFilter, onChange: this.updateNameFilter, placeholder: "Card name"})),
              React.DOM.div({className: "pure-control-group"},
                  React.DOM.label({forName: "priceFilter"}, "Price"),
                  React.DOM.input({id: "priceFilter", value: this.state.minPriceFilter, onChange: this.updatePriceFilter, placeholder: "Minimum price"})),
              React.DOM.div({className: "pure-control-group"},
                  React.DOM.label({forName: "countFilter"}, "Count"),
                  React.DOM.input({id: "countFilter", value: this.state.minCountFilter, onChange: this.updateCountFilter, placeholder: "Minimum #"}))));

      var cardTable = React.DOM.div({className: "pure-u-lg-1-2 pure-u-1"},
          React.DOM.h3({}, "Your cards"),
          PriceTable({ collection: _.filter(this.state.collection,
              function (c) {
                  return (!this.state.minPriceFilter || _.first(c.price) >= parseFloat(this.state.minPriceFilter))
                      && (!this.state.minCountFilter || c.count >= parseFloat(this.state.minCountFilter))
                      && ((new RegExp(this.state.nameFilter, "i")).test(c.name));
              }.bind(this)) })
      );

      var sumCount = function (res, cur) {
          return res + (cur.count || 0);
      };
      var minPrice = function (res, cur) {
          return res + ((_.min(cur.price) * cur.count) || 0);
      };
      var maxPrice = function (res, cur) {
          return res + ((_.max(cur.price) * cur.count) || 0);
      };

      var uniqueMatchedCards = _.size(this.state.collection);
      var allMatchedCards = _.reduce(this.state.collection, sumCount, 0);

      var minPriceSum = _.reduce(this.state.collection, minPrice, 0);
      var maxPriceSum = _.reduce(this.state.collection, maxPrice, 0);

      var statistics = React.DOM.div({className: "pure-u-lg-1-2 pure-u-1"},
          React.DOM.h3({}, "Some helpful statistics"),
          React.DOM.p({}, "I found prices for ", React.DOM.code({}, uniqueMatchedCards), " unique cards and .", React.DOM.code({}, allMatchedCards), " cards total."),
          React.DOM.p({}, "The value of the entire collection is between ", React.DOM.code({}, minPriceSum.toFixed(2)), " and ", React.DOM.code({}, maxPriceSum.toFixed(2)), " tickets."));

      var tools = React.DOM.div({className: "pure-u-1"},
          React.DOM.h3({}, "Tools and buttons"),
          React.DOM.p({}, "You have the option to ",
              React.DOM.a({className: "pure-button inline-button", onClick: this.clearLocally}, "upload"),
              " a new collection thus clearing the old one and recalculating prices."),
          React.DOM.p({}, "If you don't like having things stored you can ",
              React.DOM.a({className: "pure-button inline-button", onClick: this.clearCollection}, "clear"), " the local store."));

      var about = React.DOM.div({className: "pure-u-1"},
          React.DOM.h3({}, "About"),
          React.DOM.p({}, "Prices are scraped from ",
              React.DOM.a({href: "http://www.mtggoldfish.com"}, "mtggoldfish.com"), ". ",
              "Currently they display the price list of MTGO Traders and Cardbot. ",
              "All prices are sell prices. ", React.DOM.b({}, "Note: "),
              "Only the cards publicly listed on their site are fetched, so some valuable cards will be missed."),
          React.DOM.p({}, "This site doesn't use cookies and does not send any of your data to the server. ",
              "Everything is handled client side."),
          React.DOM.code({}, "--hiveking"));

      var rightPane = React.DOM.div({className: "pure-u-lg-1-2 pure-u-1"}, tools, about);

      return React.DOM.div({},
          React.DOM.div({className: "pure-g header"}, SiteHeader()),
          React.DOM.div({className: "pure-g container"}, filters, statistics, cardTable, rightPane));
  }
}

module.exports = Main;
