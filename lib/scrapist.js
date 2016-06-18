"use strict";

const scrape = require("./scrape");

class Scrapist {

  constructor(scheme, config) {
    this._scheme = scheme;
    this._pages = scheme.pages.map((p, i) => Object.assign({}, p, {
      index: i
    }));
    this._after = scheme.after;
    this._rootUrl = scheme.rootUrl;
    this._paramToUrls = scheme.paramToUrls;
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

  paramToUrls(param) {
    if (this._rootUrl)
      return this._rootUrl;
    if (this._paramToUrls)
      return this._paramToUrls(param);
    return param;
  }

  afterScrape(data) {
    if (this._after)
      return this._after(data);
    return data;
  }

  scrape(param, config) {
    return scrape(
      this.paramToUrls(param),
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
  fetch: null
};

module.exports = Scrapist;
