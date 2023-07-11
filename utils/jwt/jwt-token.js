const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../status-code.js");
const defaultGetRefrehTokenFn = require("./get-refresh-token-cookie.js");

let refreshTokens = [];
const userEntitys = [
  {
    email: "sapphinebz@gmail.com",
    password: "boppin",
  },
  {
    email: "sowaluk@gmail.com",
    password: "boppin",
  },
];

function doRefreshToken(getRefreshToken = defaultGetRefrehTokenFn) {
  return (req, res) => {
    const refreshToken = getRefreshToken(req);

    if (refreshToken) {
      if (refreshToken == null) {
        return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
      } else if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, userEntity) => {
          if (err) {
            return res
              .status(STATUS_CODE.NOT_ACCEPTABLE)
              .json({ message: "Unauthorized" });
          }
          const accessToken = generateAccessToken(userEntity);

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

function getJwtPayload(userEntity) {
  return { email: userEntity.email };
}

function generateAccessToken(userEntity) {
  return jwt.sign(getJwtPayload(userEntity), process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "3s",
  });
}

function generateRefreshToken(userEntity) {
  const token = jwt.sign(
    getJwtPayload(userEntity),
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );

  refreshTokens.push(token);

  return token;
}

function doLogin(project) {
  return (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const userEntity = userEntitys.find((entity) => {
      return entity.email === email && entity.password === password;
    });

    if (userEntity) {
      const accessToken = generateAccessToken(userEntity);
      const refreshToken = generateRefreshToken(userEntity, res);
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
