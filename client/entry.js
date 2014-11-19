require("!style!css!./css/default.css");

var React = require("react");
var Main = React.createFactory(require("./view/main"));

window.onload = function (e) {
    React.render(Main(), document.body);
};
