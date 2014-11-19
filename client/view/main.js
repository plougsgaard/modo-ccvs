var React = require("react");
var _ = require("underscore");
var reqwest = require("reqwest");
var IndexedDBStore = require("idb-wrapper");

var SiteHeader = React.createFactory(require("./common").SiteHeader);
var LoadingScreen = React.createFactory(require("./common").LoadingScreen);
var UploadForm = React.createFactory(require("./upload").UploadForm);
var PriceTable = React.createFactory(require("./table").PriceTable);

var service = require("./service");

var Main = React.createClass({
    getInitialState: function () {
        return {
            collection: null,
            prices: null,

            nameFilter: "",
            minPriceFilter: "",
            minCountFilter: "",

            store: null,
            storeLoading: true
        };
    },
    componentWillMount: function () {
        reqwest({url: __HOST__ /* magic */,
            type: "json"}).then(this.parsePrices);
        this.setState({ store: new IndexedDBStore({
            dbVersion: 1,
            storeName: "modocollection",
            keyPath: "id",
            autoIncrement: true,
            onStoreReady: this.canLoadStore
        })});
    },

    parsePrices: function (response) {
        this.setState({ prices: response }, this.canLoadStore);
    },
    /**
     * Attemps to load from local store once these (2 at the time of writing) conditions are met
     *  - `onStoreReady`: the indexeddb store is ready
     *  - `parsePrices`: the prices has been received from the server
     */
    canLoadStore: _.after(_.size(["onStoreReady", "parsePrices"]), function () {
        this.state.store.getAll(function (ls) {
            this.setState({
                collection: _.size(ls) > 0 && service.consolidateCollection(_.last(ls), this.state.prices),
                storeLoading: false
            })
        }.bind(this),
            function (err) {
                console.err(err);
                this.setState({ storeLoading: false });
            }.bind(this));
    }),

    handleCollectionLoaded: function (userCollectionString) {
        var c = service.consolidateCollection(service.parseCollection(userCollectionString), this.state.prices);
        this.setState({ collection: c });
        this.state.store.clear(function (msg) {
            this.state.store.put(c, function (key) {}, function (err) {});
        }.bind(this));
    },

    clearLocally: function (e) {
        this.setState({ collection: null });
    },

    clearCollection: function (e) {
        this.state.store.clear(function (msg) {
            this.clearLocally(e);
        }.bind(this))
    },

    /*
     * Forms
     */
    updatePriceFilter: function (e) {
        this.setState({ minPriceFilter: e.target.value });
    },
    updateCountFilter: function (e) {
        this.setState({ minCountFilter: e.target.value });
    },
    updateNameFilter: function (e) {
        this.setState({ nameFilter: e.target.value });
    },

    /*
     * Rendering
     */
    canRender: function () {
        return this.state.collection
            && this.state.prices;
    },
    render: function () {
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
});

module.exports = Main;
