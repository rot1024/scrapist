"use strict";

const client = require("cheerio-httpcli");

const scrape = require("./scrape");

class Scrapist {

  constructor(scheme, config) {
    this._scheme = scheme;
    this._config = Object.assign({}, Scrapist.defaultConfig, config);
  }

  get scheme() {
    return this._scheme;
  }

  get config() {
    return this._config;
  }

  beforeScrape() {
    if (this._scheme.before)
      this._scheme.before(client);
  }

  afterScrape(data) {
    if (this._scheme.after)
      return this._scheme.after(data);
    return data;
  }

  scrape(value) {
    return scrape(
      this._scheme.valueToUrls(value),
      this._scheme.pages,
      this._config.concurrency,
      this._config.interval
    ).then(data => this.afterScrape(data));
  }

}

Scrapist.defaultConfig = {
  concurrency: 1,
  interval: 1000
};

module.exports = Scrapist;
