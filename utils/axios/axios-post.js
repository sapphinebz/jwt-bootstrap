const axios = require("axios");
const { Observable } = require("rxjs");

function axiosPost(url, body = {}, resultSelector) {
  return new Observable((subscriber) => {
    const controller = new AbortController();
    axios
      .post(url, body, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        if (resultSelector) {
          subscriber.next(resultSelector(response.data));
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

module.exports = axiosPost;
