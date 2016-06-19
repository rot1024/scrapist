"use strict";

const client = require("cheerio-httpcli");

const lib = require("./lib");

lib.Scrapist.defaultConfig.fetch = context => client.fetch(context.url);
lib.Scrapist.defaultConfig.onError = err => {
  // cheerio-httpcli error has url property
  return err.hasOwnProperty("url");
};

module.exports = lib;
