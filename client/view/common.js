var React = require("react");
var _ = require("underscore");

require("./common.css");

var LoadingScreen = React.createClass({
    render: function () {
        return React.DOM.div({className: "waiting"},
            React.DOM.h4({}, (this.props.message || "Please wait..")));
    }
});

var SiteHeader = React.createClass({
    render: function () {
        return React.DOM.div({className: "pure-u-1"},
            React.DOM.h1({}, "Magic Online"),
            React.DOM.h2({}, "Card collection valuation service"));
    }
});

module.exports = {
    LoadingScreen: LoadingScreen,
    SiteHeader: SiteHeader
};
