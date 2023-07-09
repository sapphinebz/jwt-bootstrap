const { getCookie } = require("../expressjs");
const cookieName = process.env.REFRESH_TOKEN_COOKIE;

function getRefreshTokenCookie(req) {
  return getCookie(req, cookieName);
}

module.exports = getRefreshTokenCookie;
