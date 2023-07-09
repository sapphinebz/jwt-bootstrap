const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../status-code.js");
const defaultGetRefrehTokenFn = require("./get-refresh-token-cookie.js");

let refreshTokens = [];
const users = ["Thanadit", "Sowaluk"];

function doRefreshToken(getRefreshToken = defaultGetRefrehTokenFn) {
  return (req, res) => {
    const refreshToken = getRefreshToken(req);

    if (refreshToken) {
      if (refreshToken == null) {
        return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
      } else if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(STATUS_CODE.FORBIDDEN);
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) {
            return res
              .status(STATUS_CODE.NOT_ACCEPTABLE)
              .json({ message: "Unauthorized" });
          }
          const accessToken = generateAccessToken({ name: user.name });
          // attachRefreshToken(user, res);
          res.json({ accessToken });
        }
      );
    } else {
      return res
        .status(STATUS_CODE.NOT_ACCEPTABLE)
        .json({ message: "Unauthorized" });
    }
  };
}

function doLogout(getRefreshToken = defaultGetRefrehTokenFn) {
  return (req, res, next) => {
    const refreshToken = getRefreshToken(req);
    if (refreshToken) {
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
      // return res.sendStatus(204);
      res.json({ success: true });
    } else {
      return res
        .status(STATUS_CODE.NOT_ACCEPTABLE)
        .json({ message: "Unauthorized" });
    }
  };
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

function generateRefreshToken(user) {
  const token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  refreshTokens.push(token);

  return token;
}

function doLogin(project) {
  return (req, res, next) => {
    const username = req.body.username;
    if (users.some((user) => user === username)) {
      const user = { name: username };
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user, res);
      project(res, accessToken, refreshToken);
      next();
    } else {
      res.status(STATUS_CODE.NOT_ACCEPTABLE).json({
        message: "Invalid credentials",
      });
    }
  };
}

module.exports = {
  doRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  doLogout,
  doLogin,
};
