const axios = require("axios");
const { Observable } = require("rxjs");

function axiosGet(url, resultSelectorOrOptions, resultSelector) {
  let additionConfigs = {};
  let _resultSelector = null;
  if (resultSelector) {
    _resultSelector = resultSelector;
    additionConfigs = resultSelectorOrOptions;
  } else {
    _resultSelector = resultSelectorOrOptions;
  }
  return new Observable((subscriber) => {
    const controller = new AbortController();
    axios({
      method: "get",
      url,
      responseType: "json",
      signal: controller.signal,
      ...additionConfigs,
    })
      .then((response) => {
        if (_resultSelector) {
          _resultSelector(response.data);
        } else {
          subscriber.next(response.data);
        }
        subscriber.complete();
      })
      .catch((err) => {
        subscriber.error(err);
      });

    // timeout in 3 sec
    const _timerout = setTimeout(() => {
      subscriber.error("timeout");
    }, 3000);

    return {
      unsubscribe: () => {
        clearTimeout(_timerout);
        controller.abort();
      },
    };
  });
}

module.exports = axiosGet;
