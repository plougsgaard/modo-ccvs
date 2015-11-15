require("!style!css!../css/main.css");

var React = require("react");
var Main = require("./main")

window.onload = function (e) {
  React.render(<Main />, document.body);
};
