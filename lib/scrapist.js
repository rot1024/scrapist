"use strict";

const client = require("cheerio-httpcli");

const scrape = require("./scrape");

class Scrapist {

  constructor(scheme, config) {
    this._scheme = scheme;
    this._pages = scheme.pages.map((p, i) => Object.assign({}, p, {
      index: i
    }));
    this._after = scheme.after;
    this._rootUrl = scheme.rootUrl;
    this._valueToUrls = scheme.valueToUrls;
    this._config = Object.assign({}, Scrapist.defaultConfig, config);
  }

  get scheme() {
    return this._scheme;
  }

  get pages() {
    return this._pages;
  }

  get config() {
    return this._config;
  }

  valueToUrls(value) {
    if (this._rootUrl)
      return this._rootUrl;
    if (this._valueToUrls)
      return this._valueToUrls(value);
    return value;
  }

  afterScrape(data) {
    if (this._after)
      return this._after(data);
    return data;
  }

  scrape(value, config) {
    return scrape(
      this.valueToUrls(value),
      this._pages,
      Object.assign({}, this._config, config)
    ).then(data => this.afterScrape(data));
  }

}

Scrapist.defaultConfig = {
  concurrency: 1,
  interval: 1000,
  trial: 1,
  trialInterval: 1000,
  beforeFetch: null,
  onFetch: null,
  onError: null,
  fetch(url) {
    return client.fetch(url);
  }
};

module.exports = Scrapist;
