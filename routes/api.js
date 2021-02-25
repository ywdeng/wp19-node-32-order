const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const prodSpec = require("../models/product.json");
const userDAO = require('../models/user-dao');
const orderDAO = require('../models/order-dao');
const orderItemDAO = require('../models/order-item-dao');
const orderHistoryDAO = require('../models/order-history-dao');

/**
 * get product list
 */
router.get('/product', function (req, res, next) {
  res.json({ status: true, message: "ok", product: prodSpec.products });
});

/**
 * 檢查 電話號碼/使用者帳號 是否已經存在？
 */
router.get('/phone/:phone', function (req, res, next) {
  var tel = userDAO.tel2ID(req.params.phone);
  userDAO.findByID(tel, (err, data) => {
    if (err) return next(createError(500));
    if (data && data.id) {
      res.json({ exists: true, phone: req.params.phone });
    } else {
      res.json({ exists: false, phone: req.params.phone });
    }
  });
});

/**
 * 登入系統，驗證帳號密碼
 */
router.post('/login', function (req, res, next) {
  if (req.body.account && req.body.passwd) {
    id = userDAO.tel2ID(req.body.account); // user may use tel no instead of id
    userDAO.authenticate(id, req.body.passwd, (err, user) => {
      if (err) {
        res.json({ status: false, message: err.message, user: null });
      } else {
        res.json({ status: true, message: "Welcome", user: user });
      }
    });
  } else {
    next(createError(400)); // Bad Request
  }
});


/**
 * 建立新訂單
 */
router.post("/order/:userId", function (req, res, next) {
  // console.log(req.body);
  var order = orderDAO.createOrder(req);
  //console.log(order);
  userDAO.findByID(req.params.userId, (err, user) => {
    // console.log(user);
    if (err) return next(createError(500));
    if (user && user.id) {
      order.userId = user.id;
      orderDAO.insert(order, (err, data) => {
        console.log(data);
        if (err) {
          console.error(err);
          return next(createError(500));
        }
        if (order.items && (order.items.length > 0)) {
          orderItemDAO.insertWithOrderId(data.id, order.items, (err1, count) => {
            if (err1) {
              console.error(err1);
              return next(createError(500));
            }
          });
        }
        res.json({ status: true, message: 'ok', order: order });
      });
    } else {
      return next(createError(400));
    }
  });
});

module.exports = router;