"use strict";

const client = require("cheerio-httpcli");

const lib = require("./lib");

lib.Scrapist.defaultConfig.fetch = url => client.fetch(url);
lib.Scrapist.defaultConfig.onError = err => {
  // cheerio-httpcli error has url property
  return err.hasOwnProperty("url");
};

module.exports = lib;
