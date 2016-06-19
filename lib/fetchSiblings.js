"use strict";

const co = require("co");
const R = require("ramda");

const fetch = require("./fetch");
const fetchAll = require("./fetchAll");

module.exports = function fetchSiblings(urls, page, config, context) {

  if (page.toData || page.toChildren) {
    return urls.map((u, i, a) => {
      const ctx = {
        url: u,
        page,
        index: i,
        siblings: a,
        param: context.param,
        parentData: context.parentData,
        depth: context.depth,
        trial: 0,
        fetch: false
      };

      const data = page.toData ? page.toData(ctx) : null;
      const children = page.toChildren ? page.toChildren(data, ctx) : [];
      const siblings = [];

      if (config.onData) {
        config.onData(data, ctx, children, siblings);
      }

      return { data, children, siblings };
    });
  }

  if (!page.resToSiblings || page.siblingsIndex < 0) {
    return fetchAll({
      url: urls,
      page,
      siblings: urls,
      config,
      parentData: context.parentData,
      param: context.param,
      depth: context.depth
    });
  }

  const data = [];
  const queue = urls.concat([]);
  const siblings = urls.concat([]);

  return co(function *() {

    while (true) {

      if (queue.length === 0 || page.siblingsIndex >= 0 && data.length > page.siblingsIndex)
        break;

      const newData = yield fetch({
        url: queue.shift(),
        page,
        siblings,
        config,
        parentData: context.parentData,
        param: context.param,
        index: data.length,
        depth: context.depth
      });

      data.push(newData);

      if (newData.siblings.length > 0) {
        const newUrls = R.difference(newData.siblings, R.concat(queue, urls));
        queue.push.apply(queue, newUrls);
        siblings.push.apply(siblings, newUrls);
      }

    }

    if (queue.length > 0) {

      const data2 = yield fetchAll({
        url: queue,
        page,
        siblings,
        config,
        param: context.param,
        depth: context.depth
      });

      return data.concat(data2);

    }

    return data;

  });

};
