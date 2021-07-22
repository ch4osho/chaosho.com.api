const request = require("request");
const { uriMaker } = require("./vendors.js");

exports.get = function ({ url, params = null }) {
  return new Promise((resolve, reject) => {
    try {
      request(uriMaker(url, params), function (err, res, body) {
        if (!err && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};
