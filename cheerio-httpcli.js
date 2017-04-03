"use strict";

// eslint-disable-next-line node/no-unpublished-require
const client = require("cheerio-httpcli");
const lib = require("./lib");

lib.Scrapist.defaultConfig.fetch = context => client.fetch(context.url);
// cheerio-httpcli errors have url property
lib.Scrapist.defaultConfig.onError = err => err.hasOwnProperty("url");

module.exports = lib;
