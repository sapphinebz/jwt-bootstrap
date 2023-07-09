const express = require("express");
const jwt = require("jsonwebtoken");
const { expressMap } = require("./utils/expressjs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const STATUS_CODE = require("./utils/status-code.js");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.API_PORT;
const { catchError, tap, map } = require("rxjs/operators");
const { chunksGet } = require("./utils/https");
const { cache } = require("./utils/rxjs");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4000",
    preflightContinue: true,
    credentials: true,
  })
);

const users = [
  {
    username: "Thanadit",
    title: "Senior Frontend Developer",
  },
  {
    username: "Sapphinebz",
    title: "Advance Frontend Developer",
  },
];

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
  res.json(users.filter((post) => post.username === req.user.name));
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

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(STATUS_CODE.FORBIDDEN);
    req.user = user;
    next();
  });
}
