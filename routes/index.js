const express = require('express');
const createError = require('http-errors');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var viewbag = {};
  if (req.session && req.session.user) {
    viewbag.user = req.session.user;
  }
  res.render('index', viewbag);
});

module.exports = router;
