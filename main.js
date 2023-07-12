const { EMPTY } = require("rxjs");
const { catchError } = require("rxjs/operators");

const cookieparser = require("cookie-parser");
require("dotenv").config();
const express = require("express");
const {
  axiosGet,
  axiosPost,
  axiosDelete,
  axiosGetWithAuth,
} = require("./utils/axios");
const timeout = require("connect-timeout");
const { expressMap, provideBootstrap } = require("./utils/expressjs");
const {
  getRefreshTokenCookie,
  setRefreshTokenCookie,
  setAccessTokenCookie,
} = require("./utils/jwt");

const { puppet, currentGoldPrice } = require("./utils/puppeteer");

const { noAuthRedirectTo } = require("./utils/jwt");
const STATUS_CODE = require("./utils/status-code");

const app = express();

app.use(timeout("10s"));
app.use(express.json());
app.use(cookieparser());

const port = process.env.BFF_PORT;
const authPort = process.env.AUTH_PORT;
const apiPort = process.env.API_PORT;

app.get("/", (req, res) => {
  res.sendFile(`${process.cwd()}/public/login.html`);
});

app.get("/profile", noAuthRedirectTo("/"), (req, res) => {
  res.sendFile(`${process.cwd()}/public/profile/profile.html`);
});

app.get(`/login.css`, (req, res) => {
  res.sendFile(`${process.cwd()}/public/login.css`);
});

app.get(
  "/posts",
  expressMap((req, res) => {
    return axiosGetWithAuth(`http://localhost:${apiPort}/posts`, req, res, {
      next: (jsonResponse) => {
        res.json(jsonResponse);
      },
      error: (err) => {
        res.json([]);
      },
    });
  })
);

app.get(
  "/gold",
  expressMap((req, res) => {
    return axiosGetWithAuth(`http://localhost:${apiPort}/gold`, req, res, {
      next: (jsonResponse) => {
        res.json(jsonResponse);
      },
      error: (err) => {
        res.json([]);
      },
    });
  })
);

app.get(
  "/ws-config",
  expressMap((req, res) => {
    return axiosGetWithAuth(`http://localhost:${apiPort}/ws-config`, req, res, {
      next: (jsonResponse) => {
        res.json(jsonResponse);
      },
      error: (err) => {
        res.json([]);
      },
    });
  })
);

app.get(
  "/userInfo",
  expressMap((req, res) => {
    return axiosGetWithAuth(`http://localhost:${apiPort}/userInfo`, req, res, {
      next: (jsonResponse) => {
        res.json(jsonResponse);
      },
      error: (err) => {
        res.json({});
      },
    });
  })
);

app.post(
  "/login",
  expressMap((req, res) => {
    return axiosPost(
      `http://localhost:${authPort}/login`,
      {
        email: req.body.email,
        password: req.body.password,
      },
      (json) => {
        setRefreshTokenCookie(res, json.refreshToken);
        setAccessTokenCookie(res, json.accessToken);
        res.json({
          success: true,
        });
      }
    ).pipe(
      catchError((err) => {
        if (err) {
          res.sendStatus(STATUS_CODE.UNAUTHORIZED);
        }
        return EMPTY;
      })
    );
  })
);

app.delete(
  "/logout",
  expressMap((req, res) => {
    const refreshToken = getRefreshTokenCookie(req);
    return axiosDelete(
      `http://localhost:${authPort}/logout/${refreshToken}`,
      () => {
        res.json({ success: true });
      }
    ).pipe(
      catchError(() => {
        res.sendStatus(STATUS_CODE.NOT_ACCEPTABLE);
        return EMPTY;
      })
    );
  })
);

app.get(
  "/pokemons",
  expressMap((req, res) => {
    return axiosGet(
      "https://pokeapi.co/api/v2/pokemon?limit=10&offset=0",
      (data) => {
        return res.json(data);
      }
    );
  })
);

provideBootstrap(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// currentGoldPrice().subscribe(console.log);
// puppet(async (browser) => {
//   const page = await browser.newPage();
//   await page.goto(`https://www.goldtraders.or.th/`);
//   // await page.screenshot({ path: "example.png" });
//   // await page.pdf({ path: "example.pdf", format: "A4" });
//   // const html = await page.content();
//   // const title = await page.evaluate(() => document.title);
//   // const text = await page.evaluate(() => document.body.innerText);

//   const results = await page.evaluate(() => {
//     const results = [];

//     const trlist = document.querySelectorAll(
//       "#DetailPlace_uc_goldprices1_GoldPricesUpdatePanel tbody tr"
//     );

//     if (trlist) {
//       trlist.forEach((tr) => {
//         if (tr.children.length === 3) {
//           const tdList = tr.querySelectorAll("td");
//           results.push(Array.from(tdList, (el) => el.textContent.trim()));
//         }
//       });
//     }
//     return results;
//   });

// }).subscribe();
