const { throwError, timer } = require("rxjs");
const { retry, switchMap } = require("rxjs/operators");
const setAccessTokenCookie = require("./set-access-token-cookie.js");
const { axiosPost } = require("../axios");
const STATUS_CODE = require("../status-code.js");
const authPort = process.env.AUTH_PORT;
const refreshTokenDelay = 200;

function autoRefreshToken(refreshToken, res, project) {
  return retry({
    count: 3,
    delay: (error) => {
      const responseError = error.response;
      if (responseError && responseError.status === STATUS_CODE.FORBIDDEN) {
        const body = {
          refreshToken,
        };
        return timer(refreshTokenDelay).pipe(
          switchMap(() => {
            return axiosPost(
              `http://localhost:${authPort}/refresh-server`,
              body,
              (loginRes) => {
                const accessToken = loginRes.accessToken;
                setAccessTokenCookie(res, accessToken);
                project(accessToken);
              }
            );
          })
        );
      }

      return throwError(() => error);
    },
    resetOnSuccess: true,
  });
}

module.exports = autoRefreshToken;
