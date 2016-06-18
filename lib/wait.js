"use strict";

module.exports = function wait(duration) {

  if (!duration || duration <= 0) return Promise.resolve();

  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });

};
