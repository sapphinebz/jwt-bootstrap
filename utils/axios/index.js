const axiosGet = require("./axios-get.js");
const axiosDelete = require("./axios-delete.js");
const axiosPost = require("./axios-post.js");
const axiosPolling = require("./axios-polling.js");
const axiosGetWithAuth = require("./axios-get-with-auth.js");

module.exports = {
  axiosGet,
  axiosDelete,
  axiosPost,
  axiosPolling,
  axiosGetWithAuth,
};
