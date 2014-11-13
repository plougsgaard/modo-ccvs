var _ = require("underscore");

/**
 * Reads XML document line by line extracting {name,count} pairs.
 *
 * @param s XML document that has elements with `Quantity` and `Name` attributes
 * @returns an array like this [{name, count}] without repeat names
 */
var parseCollection = function (s) {
    var regex = /.*Quantity="(\d+)".*Name="(.+)".*/i;
    return _.chain(s.split(/[\r\n]+/g))
        .map(function (line) {
            var match = regex.exec(line);
            return match && { name: match[2].replace(",", ""), count: parseInt(match[1]) };
        }.bind({regex: regex}))
        .filter(function (line) {
            return !!line;
        })
        .groupBy("name")
        .map(function (ls) {
            return {
                name: _.first(ls).name,
                count: _.reduce(ls, function (res, cur) {
                    return res + cur.count
                }, 0)
            };
        })
        .value();
};

/**
 * Finds a sorted list of prices for each card in the collection that has one of more prices
 * and constructs a new copy of said collection with the prices added on as an array.
 *
 * @param collection [{name, count}] without repeat names
 * @param prices [{name, price}] with possible repeat names
 * @returns an array like this [{name, count, [price]}]
 */
var consolidateCollection = function (collection, prices) {
    return _.chain(collection)
        .union(prices)
        .groupBy("name")
        .filter(function (b) {
            return !!b;
        })
        .map(function (b) {
            var c = _.find(b, function (m) {
                return !!m.name && !!m.count;
            });
            return c && {
                name: c.name,
                count: c.count,
                price: _.chain(b).without(c).pluck("price").value().sort()
            };
        })
        .filter(function (b) {
            return !!b && _.size(b.price) > 0;
        })
        .value();
};

module.exports = {
    parseCollection: parseCollection,
    consolidateCollection: consolidateCollection
};
