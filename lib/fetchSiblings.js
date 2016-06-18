"use strict";

const co = require("co");
const R = require("ramda");

const fetch = require("./fetch");
const fetchAll = require("./fetchAll");

// siblingsIndex = resToSiblings が作用するのは何ページ目までかを示すパラメータ。

module.exports = function fetchSiblings(urls, resToData, resToChildren, resToSiblings, siblingsIndex, concurrency, interval) {

  if (!resToSiblings || siblingsIndex < 0) {
    return fetchAll(urls, resToData, resToChildren, concurrency, interval);
  }

  const data = [];
  const queue = urls.concat([]);

  return co(function *() {

    while (true) {

      if (queue.length === 0 || siblingsIndex >= 0 && data.length > siblingsIndex)
        break;

      const newData = yield fetch(queue.shift(), resToData, resToChildren, resToSiblings, interval);

      data.push(newData);

      if (newData.siblings.length > 0) {
        queue.push.apply(queue, R.difference(newData.siblings, R.concat(queue, urls)));
      }

    }

    if (queue.length > 0) {

      const data2 = yield fetchAll(queue, resToData, resToChildren, concurrency, interval);

      return data.concat(data2);

    }

    return data;

  });

};
