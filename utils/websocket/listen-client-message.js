const { Observable } = require("rxjs");

function listenClientMessage(client) {
  return new Observable((subscriber) => {
    client.addListener("message", (message) => {
      subscriber.next(message.toString());
    });
    client.addListener("close", () => {
      subscriber.complete();
    });

    return {
      unsubscribe: () => {
        client.removeAllListeners();
      },
    };
  });
}

module.exports = listenClientMessage;
