"use strict";

const co = require("co");

const fetchSiblings = require("./fetchSiblings");

function getPage(pages, depth) {

  return pages[depth];

}

function scrapeSiblings(url, pages, parentData, depth, config, param) {

  const urls = Array.isArray(url) ? url : [url];
  const page = getPage(pages, depth);

  return co(function *() {

    const data = yield fetchSiblings(
      urls,
      page,
      config,
      { depth, param, parentData }
    );

    const results = [];

    let i = 0;
    for (const d of data) {

      const children = d.children.length > 0 ? yield scrapeSiblings(
        d.children,
        pages,
        d.data,
        depth + 1,
        config,
        param
      ) : [];

      results.push({
        data: d.data,
        url: urls[i++],
        children
      });
    }

    return results;

  });

}

module.exports = function scrape(rootUrls, param, pages, config) {

  return scrapeSiblings(rootUrls, pages, null, 0, config, param);

};
