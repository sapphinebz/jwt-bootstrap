const express = require("express");
const cookieparser = require("cookie-parser");
const {
  doRefreshToken,
  doLogout,
  doLogin,
} = require("./utils/jwt/jwt-token.js");
const { setRefreshTokenCookie } = require("./utils/jwt");
// const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.AUTH_PORT;

// app.use(
// cors({
//   origin: "http://localhost:3000",
//   preflightContinue: true,
//   credentials: true,
// })
// cors()
// );
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

// const crypto = require("crypto").randomBytes(64).toString("hex");
// console.log("secret token: ", crypto);
// console.log("secret refresh token", crypto);

app.delete("/logout", doLogout());

app.delete(
  "/logout-server/:refreshToken",
  doLogout((req) => {
    return req.params["refreshToken"];
  })
);

app.post("/refresh", doRefreshToken());

app.post(
  "/login",
  doLogin((res, accessToken, refreshToken) => {
    setRefreshTokenCookie(res, refreshToken);

    res.json({ accessToken });
  })
);

app.post(
  "/login-server",
  doLogin((res, accessToken, refreshToken) => {
    res.json({ accessToken, refreshToken });
  })
);

app.post(
  "/refresh-server",
  doRefreshToken((req) => {
    return req.body.refreshToken;
  })
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
