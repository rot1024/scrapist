"use strict";

const throat = require("throat");

const fetch = require("./fetch");

module.exports = function fetchAll(urls, page, siblings, config) {

  return Promise.all(
    urls.map(
      throat(
        config.concurrency,
        u => fetch(u, page, siblings, config)
      )
    )
  );

};
