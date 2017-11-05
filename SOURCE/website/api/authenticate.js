var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require('async');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

//blacklist for token when log out, change password,...
var invalid_token = [];

router.post('/login', function(req, res, next) {
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, 'Email is required');
        return;
    }
    if (req.body.password == undefined || req.body.password == '') {
        _global.sendError(res, null, 'Password is required');
        return;
    }
    var email = req.body.email;
    var password = req.body.password;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            return console.log(error);
        }

        connection.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, email, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            //check email exist
            if (rows.length == 0) {
                _global.sendError(res, null, "Email not found");
                return console.log("Email is not existed");
            }
            var password_hash = rows[0].password;
            if (bcrypt.compareSync(password, password_hash)) {
                var token = jwt.sign(rows[0], _global.jwt_secret_key, { expiresIn: _global.jwt_expire_time });
                res.send({ result: 'success', token: token, user: rows[0] });
                connection.release();
            } else {
                _global.sendError(res, null, "Wrong password");
                return console.log("Wrong password");
            }
        });
    });
});

router.post('/logout', function(req, res, next) {
    var token = req.body.token;

    res.send({result : 'success'});
});

router.post('/forgot-password', function(req, res, next) {
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, 'Email is required');
        return;
    }
    var email = req.body.email;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            console.log(error);
        } else {
            connection.query(`SELECT * FROM users WHERE email = ? LIMIT 1`, email, function(error, rows, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    console.log(error);
                    return;
                }
                //check email exist
                if (rows.length == 0) {
                    _global.sendError(res, null, 'Email not found');
                    console.log('Email is not existed');
                    return;
                }
                let transporter = nodemailer.createTransport(_global.email_setting);
                var token = jwt.sign({ email: email }, _global.jwt_secret_key, { expiresIn: _global.jwt_reset_password_expire_time });
                var link = _global.host + '/forgot-password;token=' + token;
                let mailOptions = {
                    from: '"Giáo vụ"', // sender address
                    to: email, // list of receivers
                    subject: 'Password reset request', // Subject line
                    text: `Hi,\r\n
A password reset was requested for your account.To confirm this request, and set a new password for your account, please go to the following web address: \r\n\r\n` + link + 
` \r\n(This link is valid for 30 minutes from the time this reset was first requested)\r\n
If this password reset was not requested by you, no action is needed.\r\n
If you need help, please contact the site administrator,\r\n
Admin User
admin@fit.hcmus.edu.vn`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });
                res.send({ result: 'success' });
                connection.release();
            });
        }
    });
});

router.post('/reset-password-check', function(req, res, next) {
    if (req.body.token == undefined || req.body.token == '') {
        _global.sendError(res, null, 'Token is required');
        return;
    }
    var token = req.body.token;
    if (token) {
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if (error.name == 'TokenExpiredError') {
                    _global.sendError(res, null, 'The password reset link you used is more than 30 minutes old and has expired. Please initiate a new password reset.');
                    return console.log('The password reset link you used is more than 30 minutes old and has expired. Please initiate a new password reset.');
                }
                _global.sendError(res, null, 'Invalid token');
                return console.log('Invalid token');

            } else {
                res.send({ result: 'success' });
            }
        });
    }
});

router.post('/reset-password', function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if (error.name == 'TokenExpiredError') {
                    return res.status(401).send({
                        success: false,
                        message: error.message
                    });
                }
            } else {
                if (req.body.password == undefined || req.body.password == '') {
                    _global.sendError(res, null, 'Password is required');
                    return;
                }
                if (req.body.confirm_password == undefined || req.body.confirm_password == '') {
                    _global.sendError(res, null, 'Confirm Password is required');
                    return;
                }
                var password = req.body.password;
                var confirm_password = req.body.confirm_password;
                if (password != confirm_password) {
                    _global.sendError(res, null, 'Password and Confirm password must be the same');
                    return;
                }
                var email = decoded.email;
                pool.getConnection(function(error, connection) {
                    if (error) {
                        _global.sendError(res, error.message);
                        return console.log(error);
                    }
                    connection.query(`UPDATE users SET password = ? WHERE email = ?`, [bcrypt.hashSync(password, 10),email], function(error, rows, fields) {
                        if (error) {
                            _global.sendError(res, error.message);
                            return console.log(error);
                        }
                        res.send({ result: 'success'});
                        connection.release();
                    });
                });
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
});

module.exports = router;
