const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const rememberMe = require('../remember-me');

router.get('/', function (req, res, next) {
    // destroy cookie
    if (req.cookies && req.cookies.rememberMe) {
        rememberMe.clearCookie(res);
    }
    // destroy session
    if (req.session) {
        // delete session
        req.session.destroy((err) => {
            if (err) return next(err);
            return res.redirect('/');
        });
    }
});

module.exports = router;