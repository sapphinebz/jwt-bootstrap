const autoRefreshToken = require("./auto-refresh-token.js");
const noAuthRedirectTo = require("./no-auth-redirect-to.js");
const getRefreshTokenCookie = require("./get-refresh-token-cookie.js");
const getAccessTokenCookie = require("./get-access-token-cookie.js");
const setRefreshTokenCookie = require("./set-refresh-token-cookie.js");
const setAccessTokenCookie = require("./set-access-token-cookie.js");
const authenticateToken = require("./authenticate-token.js");

module.exports = {
  noAuthRedirectTo,
  getRefreshTokenCookie,
  getAccessTokenCookie,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  autoRefreshToken,
  authenticateToken,
};
