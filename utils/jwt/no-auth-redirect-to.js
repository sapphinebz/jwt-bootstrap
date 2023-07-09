const getRefreshTokenCookie = require("./get-refresh-token-cookie.js");
// const getAccessTokenCookie = require("./get-access-token-cookie.js");
function noAuthRedirectTo(path) {
  return (req, res, next) => {
    const refreshToken = getRefreshTokenCookie(req);
    // const accessToken = getAccessTokenCookie(req);
    // if (refreshToken && accessToken) {
    if (refreshToken) {
      next();
    } else {
      res.redirect(path);
    }
  };
}

module.exports = noAuthRedirectTo;
