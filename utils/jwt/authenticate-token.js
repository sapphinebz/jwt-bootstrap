const jwt = require("jsonwebtoken");
const STATUS_CODE = require("../status-code");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    return res.sendStatus(STATUS_CODE.UNAUTHORIZED);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(STATUS_CODE.FORBIDDEN);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
