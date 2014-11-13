var React = require("react");
var _ = require("underscore");

var signature = { name: "name", count: "count", price: "price", sum: "sum" };

var PriceTable = React.createClass({
    propTypes: {
        collection: React.PropTypes.array.isRequired
    },
    getInitialState: function () {
        return {
            sortBy: {key: signature.price, asc: false}
        }
    },
    getSortedData: function () {
        var res = _.chain(this.props.collection)
            .map(function (c) {
                return {
                    key: c.name,
                    name: React.DOM.a({href: "http://www.mtggoldfish.com/q?query_string=".concat(_.escape(c.name).replace(" ", "+"))}, c.name),
                    count: c.count,
                    price: _.min(c.price),
                    sum: parseFloat((c.count * _.min(c.price)).toFixed(2))
                }
            })
            .sortBy(this.state.sortBy.key);
        if (!this.state.sortBy.asc) {
            return res.reverse().value();
        }
        return res.value();
    },

    handleSortBy: function (key) {
        this.setState({
            sortBy: {
                key: key,
                asc: this.state.sortBy.key == key ? !this.state.sortBy.asc : false
            }
        });
    },

    handleSortByName: function (e) {
        this.handleSortBy(signature.name);
    },
    handleSortByCount: function (e) {
        this.handleSortBy(signature.count);
    },
    handleSortByPrice: function (e) {
        this.handleSortBy(signature.price);
    },
    handleSortBySum: function (e) {
        this.handleSortBy(signature.sum);
    },

    getTableHeadClass: function (key) {
        return key == this.state.sortBy.key ? "highlight" : "normal";
    },

    render: function () {
        var head = React.DOM.thead({},
            React.DOM.tr({},
                React.DOM.th({onClick: this.handleSortByName,
                    className: this.getTableHeadClass(signature.name)}, "Name"),
                React.DOM.th({onClick: this.handleSortByCount,
                    className: this.getTableHeadClass(signature.count)}, "#"),
                React.DOM.th({onClick: this.handleSortByPrice,
                    className: this.getTableHeadClass(signature.price)}, "Price"),
                React.DOM.th({onClick: this.handleSortBySum,
                    className: this.getTableHeadClass(signature.sum)}, "Sum")));
        var body = React.DOM.tbody({}, _.map(this.getSortedData(), function (c) {
            return React.DOM.tr({key: c.key},
                React.DOM.td({}, c.name),
                React.DOM.td({}, c.count),
                React.DOM.td({}, c.price),
                React.DOM.td({}, c.sum));
        }));

        return React.DOM.table({className: "pure-table pure-table-striped white"}, head, body);
    }
});

module.exports = {
    PriceTable: PriceTable
};
