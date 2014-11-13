var http = require("http");
var request = require("request");
var cheerio = require("cheerio");
var _ = require("underscore");
var async = require("async");

var usageString = "Usage:\nHOST=http://example.com FILE_ROOT=http://example.com/files/ node scraper.js";
var host = process.env.HOST;
var fileRoot = process.env.FILE_ROOT;

if (!host) {
    console.log("`HOST` not supplied.");
    console.log(usageString);
    return;
}

if (!fileRoot) {
    console.log("`FILE_ROOT` not supplied.");
    console.log(usageString);
    return;
}

var sites = _.map(["special", "standard", "modern_one", "modern_two",
    "legacy_one", "legacy_two", "vintage", "ignore"],
    function (name) {
        return fileRoot.concat(name);
    });

var headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": host,
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
};

var load = function (site, callback) {
    request(site, function (error, response, body) {
        if (error || response.statusCode != 200) {
            callback({ message: "Error making request." }, null)
        }
        var q = cheerio.load(body);
        callback(null, q("dt.dontsplit").map(function () {
            return { name: q(this, "a").text(), price: parseFloat(q(this).next().text()) };
        }));
    });
};

var loadSites = function () {
    return _.map(sites, function (site) {
        return function (callback) {
            load(this.site, callback)
        }.bind({site: site});
    })};

var server = http.createServer(function (request, response) {
    if (request.url === "/favicon.ico") {
        response.writeHead(200, {"Content-Type": "image/x-icon"});
        response.end();
        return;
    }

    var performResponse = function (body) {
        this.response.writeHead(200, headers);
        this.response.write(body);
        this.response.end();
    }.bind({response: response});

    async.parallel(loadSites(), function (err, res) {
        this.performResponse(
            JSON.stringify(
                _.chain(res)
                    .map(function (r) { return _.toArray(r); })
                    .flatten()
                    .value()));
    }.bind({performResponse: performResponse}));
});

server.listen(8000);
