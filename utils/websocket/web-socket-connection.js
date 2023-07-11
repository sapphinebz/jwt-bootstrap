const { Observable } = require("rxjs");

function webSocketConnection(ws) {
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

module.exports = webSocketConnection;
