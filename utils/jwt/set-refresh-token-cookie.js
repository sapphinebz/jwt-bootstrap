const { setCookie } = require("../expressjs");
const cookieName = process.env.REFRESH_TOKEN_COOKIE;

function setRefreshTokenCookie(res, refreshToken) {
  setCookie(res, cookieName, refreshToken);
  return res;
}

module.exports = setRefreshTokenCookie;
