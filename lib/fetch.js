"use strict";

const wait = require("./wait");

const client = require("cheerio-httpcli");

module.exports = function fetch(url, page, siblings, config) {

  return wait(config.interval)
    .then(() => client.fetch(url))
    .then(result => {
      const data = {
        data: page.resToData(result.err, result.$, result.res, result.body),
        children: page.resToChildren ? page.resToChildren(result.err, result.$, result.res, result.body) : [],
        siblings: page.resToSiblings ? page.resToSiblings(result.err, result.$, result.res, result.body) : []
      };

      if (config.onFetch) {
        config.onFetch(data, url, page, siblings);
      }

      return data;
    });

};
