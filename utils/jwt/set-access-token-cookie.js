const { setCookie } = require("../expressjs");
const cookieName = process.env.ACCESS_TOKEN_COOKIE;

function setAccessTokenCookie(res, accessToken) {
  setCookie(res, cookieName, accessToken);
  return res;
}

module.exports = setAccessTokenCookie;
