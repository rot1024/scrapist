"use strict";

const throat = require("throat");

const fetch = require("./fetch");

module.exports = function fetchAll(urls, resToData, resToChildren, concurrency, interval) {

  return Promise.all(
    urls.map(
      throat(
        concurrency,
        u => fetch(u, resToData, resToChildren, null, interval)
      )
    )
  );

};
