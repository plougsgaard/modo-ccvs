var React = require("react");
var _ = require("underscore");

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

var UploadForm = React.createClass({
    propTypes: {
        fileLoadedCallback: React.PropTypes.func.isRequired
    },
    handleFileSelected: function (e) {
        var f = _.first(e.target.files);
        var reader = new FileReader();
        reader.onloadend = function (e) {
            this.props.fileLoadedCallback(e.target.result);
        }.bind(this);
        reader.readAsText(f);
    },
    render: function () {
        var uploadHeader = React.DOM.div({className: "pure-u-1"},
            React.DOM.h3({}, "Upload your collection"));

        var guide = React.DOM.div({className: "pure-u-md-1-2 pure-u-1"},
            React.DOM.h4({}, "How do I do that?"),
            React.DOM.ol({},
                React.DOM.li({}, "Go to collection and show as list."),
                React.DOM.li({}, "Close all open decks and clear the search filter."),
                React.DOM.li({}, "Select a card and press Ctrl+A."),
                React.DOM.li({}, "Right click and export to a .dek-file."),
                React.DOM.li({}, "Go to this page."),
                React.DOM.li({}, "Click the giant upload button and find the file you just saved."),
                React.DOM.li({}, "Done!")));

        var uploadButton = React.DOM.div({className: "pure-u-md-1-2 pure-u-1"},
            React.DOM.div({className: "upload pure-button pure-button-primary"},
                React.DOM.span({}, "Upload"),
                React.DOM.br({}),
                React.DOM.input({className: "upload", type: "file", id: "fileInput", onChange: this.handleFileSelected})));

        return React.DOM.div({},
            React.DOM.div({className: "pure-g header"}, SiteHeader()),
            React.DOM.div({className: "pure-g container"}, uploadHeader, guide, uploadButton));
    }
});

module.exports = {
    LoadingScreen: LoadingScreen,
    SiteHeader: SiteHeader,
    UploadForm: UploadForm
};