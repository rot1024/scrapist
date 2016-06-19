"use strict";

const wait = require("./wait");

module.exports = function fetch(options) {

  const counter = options.counter || 0;

  const context = {
    url: options.url,
    page: options.page,
    index: options.index,
    siblings: options.siblings,
    param: options.param,
    parentData: options.parentData,
    depth: options.depth,
    trial: counter,
    fetch: true
  };

  return wait(options.interval || options.config.interval)
    .then(() => {
      if (options.config.beforeFetch)
        options.config.beforeFetch(context);
      return options.config.fetch(context);
    })
    .then(
      result => {
        const data = options.page.resToData ?
          options.page.resToData(result, context) : null;
        const children = options.page.resToChildren ?
          options.page.resToChildren(result, data, context) : [];
        const siblings = options.page.resToSiblings ?
          options.page.resToSiblings(result, data, context) : [];

        if (options.config.onData) {
          options.config.onData(data, context, data.children, data.siblings);
        }

        return { data, children, siblings };
      },
      err => {
        if (
          !options.config.onError ||
          !options.config.onError(err, context)
        ) {
          throw err;
        }

        if (counter < options.config.trial) {
          const ti = options.config.trialInterval;
          return fetch(Object.assign({}, options, {
            counter: counter + 1,
            interval: typeof ti === "function" ?
              ti(counter + 1, options.config.trial) : ti
          }));
        }

        throw err;
      });

};
