"use strict";

const throat = require("throat");

const fetch = require("./fetch");

module.exports = function fetchAll(options) {

  return Promise.all(
    options.url.map(
      throat(
        options.config.concurrency,
        u => fetch(Object.assign({}, options, { url: u }))
      )
    )
  );

};
