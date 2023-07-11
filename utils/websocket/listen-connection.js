const { Observable } = require("rxjs");

function listenConnection(ws) {
  return new Observable((subscriber) => {
    ws.addListener("connection", (client, req) => {
      subscriber.next({ client, req });
    });
    return {
      unsubscribe: () => {
        ws.removeAllListeners();
      },
    };
  });
}

module.exports = listenConnection;
