"use strict";

const co = require("co");

const fetchSiblings = require("./fetchSiblings");

function getPage(pages, depth) {

  return pages[depth];

}

function scrapeSiblings(urls, pages, depth, config) {

  const page = getPage(pages, depth);

  return co(function *() {

    const data = yield fetchSiblings(
      Array.isArray(urls) ? urls : [urls],
      page.resToData,
      page.resToChildren,
      page.resToSiblings,
      page.siblingsIndex,
      config
    );

    const results = [];

    for (const d of data) {

      const result = { page: d };

      if (d.children.length > 0) {
        result.children = yield scrapeSiblings(
          d.children,
          pages,
          depth + 1,
          config
        );
      }

      results.push(result);
    }

    return results;

  });

}

module.exports = function scrape(rootUrls, pages, config) {

  return scrapeSiblings(rootUrls, pages, 0, config);

};
