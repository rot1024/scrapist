"use strict";

const throat = require("throat");

const fetch = require("./fetch");

module.exports = function fetchAll(options) {

  return Promise.all(
    options.urls.map(
      throat(
        options.config.concurrency,
        u => fetch({
          url: u,
          page: options.page,
          siblings: options.siblings,
          config: options.config,
          interval: options.interval
        })
      )
    )
  );

};
