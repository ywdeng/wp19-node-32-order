const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const prodSpec = require("../models/product.json");

router.get('/', function (req, res, next) {
  var viewbag = { prodList: prodSpec.products };
  if (req.session && req.session.user) {
    viewbag.user = req.session.user;
  }
  res.render("menu", viewbag);
});

module.exports = router;