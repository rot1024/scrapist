"use strict";

const wait = require("./wait");

const client = require("cheerio-httpcli");

module.exports = function fetch(url, resToData, resToChildren, resToSiblings, interval) {

  return wait(interval)
    .then(() => client.fetch(url))
    .then(result => ({
      data: resToData(result.err, result.$, result.res, result.body),
      children: resToChildren ? resToChildren(result.err, result.$, result.res, result.body) : [],
      siblings: resToSiblings ? resToSiblings(result.err, result.$, result.res, result.body) : []
    }));

};
