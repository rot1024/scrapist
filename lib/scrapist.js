"use strict";

const scrape = require("./scrape");

class Scrapist {

  constructor(scheme, config) {
    this._scheme = scheme;
    this._pages = scheme.pages;
    this._after = scheme.after;
    this._rootUrl = scheme.rootUrl;
    this._defaultParam = scheme.defaultParam;
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

    const p = typeof param === "object" && this._defaultParam ?
      Object.assign({}, this._defaultParam, param) :
      typeof param === "undefined" ? this._defaultParam : param;

    const conf = Object.assign({}, this._config, config);

    if (typeof conf.fetch !== "function") {
      throw new Error("scrapist: config.fetch is not a function");
    }

    return scrape(
      this.getRootUrl(p),
      p,
      this._pages,
      conf
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
  onError: () => true,
  fetch: null
};

module.exports = Scrapist;
