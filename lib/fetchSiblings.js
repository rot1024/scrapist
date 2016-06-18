"use strict";

const co = require("co");
const R = require("ramda");

const fetch = require("./fetch");
const fetchAll = require("./fetchAll");

module.exports = function fetchSiblings(
  urls,
  page,
  config
) {

  if (!page.resToSiblings || page.siblingsIndex < 0) {
    return fetchAll(urls, page, urls, config);
  }

  const data = [];
  const queue = urls.concat([]);
  const siblings = urls.concat([]);

  return co(function *() {

    while (true) {

      if (queue.length === 0 || page.siblingsIndex >= 0 && data.length > page.siblingsIndex)
        break;

      const newData = yield fetch(queue.shift(), page, siblings, config);

      data.push(newData);

      if (newData.siblings.length > 0) {
        const newUrls = R.difference(newData.siblings, R.concat(queue, urls));
        queue.push.apply(queue, newUrls);
        siblings.push.apply(siblings, newUrls);
      }

    }

    if (queue.length > 0) {

      const data2 = yield fetchAll(queue, page, siblings, config);

      return data.concat(data2);

    }

    return data;

  });

};
