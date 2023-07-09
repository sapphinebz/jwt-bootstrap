const { EMPTY, defer, identity } = require("rxjs");
const { catchError, tap } = require("rxjs/operators");

const cookieparser = require("cookie-parser");
require("dotenv").config();
const express = require("express");
const { axiosGet, axiosPost, axiosDelete } = require("./utils/axios");
const timeout = require("connect-timeout");
const { expressMap, provideBootstrap } = require("./utils/expressjs");
const {
  getRefreshTokenCookie,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  getAccessTokenCookie,
  autoRefreshToken,
} = require("./utils/jwt");

const { noAuthRedirectTo } = require("./utils/jwt");
const STATUS_CODE = require("./utils/status-code");

const app = express();

app.use(timeout("3s"));
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
    return httpGetWithAuth(`http://localhost:${apiPort}/posts`, req, res, {
      next: (jsonResponse) => {
        res.json(jsonResponse);
      },
      error: () => {
        res.json([]);
      },
    });
  })
);

app.get(
  "/gold",
  expressMap((req, res) => {
    return httpGetWithAuth(`http://localhost:${apiPort}/gold`, req, res, {
      next: (jsonResponse) => {
        res.json(jsonResponse);
      },
      error: () => {
        res.json([]);
      },
    });
  })
);

app.get(
  "/userInfo",
  expressMap((req, res) => {
    return httpGetWithAuth(`http://localhost:${apiPort}/userInfo`, req, res, {
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
      `http://localhost:${authPort}/login-server`,
      {
        username: req.body.username,
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
      `http://localhost:${authPort}/logout-server/${refreshToken}`,
      () => {
        // console.log("redirect");
        // res.redirect("/");
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

function httpGetWithAuth(url, req, res, options) {
  const refreshToken = getRefreshTokenCookie(req);

  const handleError = options.error
    ? catchError((err) => {
        return EMPTY;
      })
    : identity;
  let accessToken = getAccessTokenCookie(req);

  return defer(() => {
    return axiosGet(
      url,
      {
        headers: { authorization: `Bearer ${accessToken}` },
      },
      options.next
    );
  }).pipe(
    autoRefreshToken(refreshToken, res, (token) => {
      accessToken = token;
    }),
    handleError
  );
}
