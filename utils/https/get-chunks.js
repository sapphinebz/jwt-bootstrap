const nodeHttps = require("node:https");
const { Observable } = require("rxjs");

function httpsGet(url) {
  return new Observable((subscriber) => {
    const _https = nodeHttps.get(url, (res) => {
      let chunks = "";

      res.addListener("data", (d) => {
        chunks += d;
      });

      res.addListener("end", () => {
        subscriber.next(chunks);
        subscriber.complete();
      });

      subscriber.add(res.removeAllListeners.bind(res));
    });

    _https.addListener("error", (e) => {
      subscriber.error(e);
    });

    return {
      unsubscribe: () => {
        _https.removeAllListeners();
      },
    };
  });
}

module.exports = httpsGet;
