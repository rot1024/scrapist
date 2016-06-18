"use strict";

const wait = require("./wait");

const client = require("cheerio-httpcli");

module.exports = function fetch(options) {

  const counter = options.counter || 0;

  return wait(options.interval || options.config.interval)
    .then(() => client.fetch(options.url))
    .then(
      result => {
        const data = {
          data: options.page.resToData(result.err, result.$, result.res, result.body),
          children: options.page.resToChildren ?
            options.page.resToChildren(result.err, result.$, result.res, result.body) : [],
          siblings: options.page.resToSiblings ?
            options.page.resToSiblings(result.err, result.$, result.res, result.body) : []
        };

        if (options.config.onFetch) {
          options.config.onFetch(data, options.url, options.page, options.siblings);
        }

        return data;
      },
      err => {
        if (counter < options.config.trial) {
          const ti = options.config.trialInterval;
          return fetch(Object.assign({}, options, {
            counter: counter + 1,
            interval: typeof ti === "function" ?
              ti(counter + 1, options.config.trial) : ti
          }));
        }
        throw err;
      });

};
