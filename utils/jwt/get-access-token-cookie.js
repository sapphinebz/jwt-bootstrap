const { getCookie } = require("../expressjs");
const cookieName = process.env.ACCESS_TOKEN_COOKIE;

function getAccessTokenCookie(req) {
  return getCookie(req, cookieName);
}

module.exports = getAccessTokenCookie;
