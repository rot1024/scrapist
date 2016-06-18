"use strict";

const throat = require("throat");

const fetch = require("./fetch");

module.exports = function fetchAll(urls, resToData, resToChildren, config) {

  return Promise.all(
    urls.map(
      throat(
        config.concurrency,
        u => fetch(u, resToData, resToChildren, null, config)
      )
    )
  );

};
