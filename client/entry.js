require("!style!css!./css/main.css");

var React = require("react");
var Main = React.createFactory(require("./js/main"));

window.onload = function (e) {
    React.render(Main(), document.body);
};
