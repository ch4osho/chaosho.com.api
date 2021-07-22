exports.uriMaker = function (path, params) {
  if (Object.prototype.toString.call(params).indexOf("Object") === -1) {
    return path;
  }
  path += "?";
  for (let attr in params) {
    path += `${attr}=${params[attr]}&`;
  }

  return path.substring(0, path.length - 1);
};
