const { catchError } = require("rxjs/operators");
const {
  autoRefreshToken,
  getAccessTokenCookie,
  getRefreshTokenCookie,
} = require("../jwt");
const { EMPTY, defer, identity, throwError, NEVER } = require("rxjs");
const axiosGet = require("./axios-get");
const STATUS_CODE = require("../status-code");

function axiosGetWithAuth(url, req, res, options) {
  const refreshToken = getRefreshTokenCookie(req);

  const handleError = options.error
    ? catchError((err) => {
        options.error(err);
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
    catchError((err) => {
      if (err.response.status === STATUS_CODE.UNAUTHORIZED) {
        res.sendStatus(STATUS_CODE.UNAUTHORIZED);
        return NEVER;
      }
      return throwError(() => err);
    }),
    handleError
  );
}

module.exports = axiosGetWithAuth;
