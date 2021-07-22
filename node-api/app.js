var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const logger = require("morgan");
const chatRoomServer = require("./utils/ws2chat.js");

const isDev = process.env.NODE_ENV === 'dev'

const indexRouter = require("./routes/index");

const app = express();

app.disable("etag");


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 添加静态文件地址
app.use(express.static(path.join(__dirname, "public")));


// 路由分发
app.use("/api", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 聊天室服务
app.chatServe = new chatRoomServer();

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(isDev ? 8088 : 3000);

module.exports = app;
