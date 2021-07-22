module.exports = function (connect, sql) {
  return new Promise((resolve, reject) => {
    connect.query(sql, (error, results, fields) => {
      if (error)
        reject({
          success: false,
          queryData: error,
        });
      else {
        resolve({
          success: true,
          queryData: results,
        });
      }
    });
  })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};
