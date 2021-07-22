const md5 = require("js-md5");
const mysqlConfig = require("../utils/mysqlConfig.js");
const mysql = require("mysql");
const myResponse = require("../utils/response.js");
const mqp = require("../utils/mysqlQueryPromise.js");
const forwradRequest = require("../utils/forwardRequest.js");

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send('helloWorld')
});

// 获取所有基金
router.get("/getAllFund", function (req, res, next) {
  console.log("这是请求get", req.query);
  const { fund_code, optCode } = req.query;
  if (optCode !== md5("chaos_all_fund")) {
    myResponse(res, 403, "鉴权失败");
  }

  var connection = mysql.createConnection(mysqlConfig);

  connection.connect();

  console.log('this is connect!!!!',connection)


  connection.query(`SELECT * FROM fund`, function (error, results, fields) {
    if (error) {
      console.log('这是错误',error)
      throw error;
    } else {
      myResponse(res, 200, "获取基金列表成功", results);
    }
  });

  connection.end();
});

router.get("/forward", async function (req, res, next) {
  const fres = await forwradRequest.get({
    url: "http://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx",
    params: req.query,
  });
  myResponse(res, 200, "获取基金列表成功", JSON.parse(fres));
});

// 添加基金
router.get("/addFund", async function (req, res, next) {
  const { fundCode, fundName, optCode } = req.query;

  if (optCode !== md5("chaos_add_fund")) {
    myResponse(res, 403, "鉴权失败");
    return;
  }

  // 连接数据库
  var connection = mysql.createConnection(mysqlConfig);
  connection.connect();

  const sortRes = await mqp(
    connection,
    `SELECT COUNT(*) AS nums FROM fund WHERE fund_code = '${fundCode}'`
  );

  // 检查记录是否已经存在
  if (sortRes.success && sortRes.queryData[0].nums !== 0) {
    connection.end();
    myResponse(res, 201, "该基金已经添加");
    return;
  }

  // 插入基金
  const queryRes = await mqp(
    connection,
    `INSERT INTO fund (fund_name, fund_code, fund_timestamp) VALUES ('${fundName}','${fundCode}','${new Date().getTime()}')`
  );

  if (queryRes.success) {
    myResponse(res, 200, "添加基金成功", {
      fundCode,
      fundName,
    });
  } else {
    myResponse(res, 200, "添加基金失败", queryRes);
  }

  connection.end();
});

router.get("/deleteFund", function () {});

router.post("/post", function (req, res, next) {
  console.log("这是请求post", req.query);
  var data = {
    data: "这是post请求",
    code: 200,
  };
  res.writeHead(200, { "Content-Type": "application/json" });

  res.end(JSON.stringify(data));
});

module.exports = router;
