function setCookie(res, name, value) {
  res.cookie(name, value, {
    // httpOnly: true,
    // sameSite: "None",
    // sameSite: "Lax",
    // secure: true,
    // maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "None",
    secure: true,
    expires: new Date(Date.now() + 8 * 3600000),
    // path: "/",
    domain: "localhost",
  });
  return res;
}

module.exports = setCookie;
