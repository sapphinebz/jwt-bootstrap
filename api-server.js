const express = require("express");
const { expressMap } = require("./utils/expressjs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { WebSocketServer } = require("ws");

require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.API_PORT;
const { chunksGet } = require("./utils/https");
const { cache } = require("./utils/rxjs");
const { authenticateToken } = require("./utils/jwt");
const { Subject, using } = require("rxjs");
const { catchError, tap, map, mergeMap } = require("rxjs/operators");
const { webSocketConnection, clientMessage } = require("./utils/websocket");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4000",
    preflightContinue: true,
    credentials: true,
  })
);

// const users = [
//   {
//     username: "Thanadit",
//     title: "Senior Frontend Developer",
//   },
//   {
//     username: "Sapphinebz",
//     title: "Advance Frontend Developer",
//   },
// ];

const posts = [
  {
    title: "What the heck of JWT?",
  },
  {
    title: "What is Angular?",
  },
];

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/public/main.html`);
});

app.get("/userInfo", authenticateToken, (req, res) => {
  res.json([req.user]);
});

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts);
});

const sharedGold$ = chunksGet("https://www.goldtraders.or.th/").pipe(
  map((chunks) => {
    const dom = new JSDOM(chunks);
    const document = dom.window.document;

    const results = [];

    const trlist = document.querySelectorAll(
      "#DetailPlace_uc_goldprices1_GoldPricesUpdatePanel tbody tr"
    );

    if (trlist) {
      trlist.forEach((tr) => {
        if (tr.children.length === 3) {
          const tdList = tr.querySelectorAll("td");
          results.push(Array.from(tdList, (el) => el.textContent.trim()));
        }
      });
    }

    return results;
  }),
  cache({ windowTime: 10000 })
);

app.get(
  "/gold",
  authenticateToken,
  expressMap((req, res) => {
    return sharedGold$
      .pipe(
        tap((results) => {
          res.json(results);
        })
      )
      .pipe(
        catchError(() => {
          res.json([]);
          return EMPTY;
        })
      );
  })
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const configWebSocket = {
  port: process.env.WS_PORT,
  path: "/boppin",
};

app.get("/ws-config", authenticateToken, (req, res) => {
  res.json(configWebSocket);
});

const ws = new WebSocketServer(configWebSocket);
const serverMessage = new Subject();

webSocketConnection(ws)
  .pipe(
    mergeMap(({ client }) => {
      return using(
        () =>
          serverMessage.subscribe((msg) => {
            client.send(msg);
          }),
        () => clientMessage(client)
      );
    })
  )
  .subscribe((clientToServer) => {
    console.log(clientToServer);
  });
