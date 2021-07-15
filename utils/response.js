module.exports = function (res, status, msg, data = null) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status,
      data,
      msg,
    })
  );
};
