const { fromEventPattern, identity } = require("rxjs");

function fromListener(nodeEmitter, eventName, resultSelector = identity) {
  return fromEventPattern(
    (handler) => {
      nodeEmitter.addListener(eventName, handler);
    },
    (handler) => {
      nodeEmitter.removeListener(eventName, handler);
    },
    resultSelector
  );
}

module.exports = fromListener;
