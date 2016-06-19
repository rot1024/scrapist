"use strict";

const scrape = require("./scrape");

class Scrapist {

  constructor(scheme, config) {
    this._scheme = scheme;
    this._pages = scheme.pages;
    this._after = scheme.after;
    this._rootUrl = scheme.rootUrl;
    this._config = Object.assign({}, Scrapist.defaultConfig, config);
  }

  get scheme() {
    return this._scheme;
  }

  get config() {
    return this._config;
  }

  getRootUrl(param) {
    if (typeof this._rootUrl === "function")
      return this._rootUrl(param);
    if (typeof this._rootUrl === "string")
      return this._rootUrl;
    return param;
  }

  afterScrape(data) {
    if (this._after)
      return this._after(data);
    return data;
  }

  scrape(param, config) {
    return scrape(
      this.getRootUrl(param),
      param,
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
  onData: null,
  onError: null,
  fetch: null
};

module.exports = Scrapist;
