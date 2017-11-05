var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');

router.post('/detail', function(req, res, next) {
    if (req.body.id != null) {
        user_id = req.body.id;
    } else {
        _global.sendError(res, "Missing user id", "Require user\'s ID");
        return;
    }

    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        connection.query(`SELECT id,last_name,first_name,email,phone,role_id as role FROM users WHERE id=? LIMIT 1`, user_id,
            function(error, rows, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                }

                //check user exist
                if (rows.length == 0) {
                    _global.sendError(res, 'User\'s ID not exist');
                    throw 'User\'s ID not exist';
                }

                var user = rows[0];
                res.send({ result: 'success', user: user });
                connection.release();
            });
    });
});

router.put('/update', function(req, res, next) {
    if (req.body.id != null) {
        user_id = req.body.id;
    } else {
        _global.sendError(res, "Missing user id", "Require user\'s ID");
        return;
    }

    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        connection.query(`SELECT id,last_name,first_name,email,phone FROM users WHERE id=? LIMIT 1`, user_id, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }

            //check user exist
            if (rows.length == 0) {
                _global.sendError(res, 'User\'s ID not exist');
                throw 'User\'s ID not exist';
            }

            //build query
            var params = [];
            var query = '';

            if (req.body.firs_tname != null) {
                params.push(req.body.first_name);
                query = 'first_name = ?';
            }
            if (req.body.last_name != null) {
                params.push(req.body.last_name);
                query += ', last_name = ?';
            }
            if (req.body.name != null) {
                params.push(_global.getFirstName(req.body.name));
                query += ', first_name = ?';
                params.push(_global.getLastName(req.body.name));
                query += ', last_name = ?';
            }
            if (req.body.email != null) {
                params.push(req.body.email);
                query += ', email = ?';
            }
            if (req.body.phone != null) {
                params.push(req.body.phone);
                query += ', phone = ?'
            }

            if (params.length == 0) {
                res.send({ result: 'success', message: 'nothing update', data: rows[0] });
            }

            params.push(user_id);
            //update to user table
            connection.query('UPDATE users SET ' + query + 'WHERE id=? LIMIT 1', params, function(error, result, fields) {
                if (error) {
                    _global.sendError(res.error.message);
                    return connection.rollback(function() {
                        throw error;
                    });
                }

                res.send({ result: 'success', message: 'User Updated Successfully', data: result });
                connection.release();
            });
        });
    });
});

router.delete('/delete', function(req, res, next) {
    if (req.body.id != null) {
        user_id = req.body.id;
    } else {
        _global.sendError(res, "Missing user id", "Require user\'s ID");
        return;
    }

    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        connection.query(`SELECT id,last_name,first_name,email,phone,role_id FROM users WHERE id=? LIMIT 1`, user_id,
            function(error, rows, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                }

                //check user exist
                if (rows.length == 0) {
                    _global.sendError(res, 'User\'s ID not exist');
                    throw 'User\'s ID not exist';
                }

                var user = rows[0];
                /*res.send({ result: 'success', message: 'Delete User Successfully', detail: user });
                connection.query('INSERT INTO teachers SET ?', teacher, function(error, results, fields) {
                    if (error) {
                        _global.sendError(res. error.message);
                        return connection.rollback(function() {
                            throw error;
                        });
                    }
                    connection.commit(function(error) {
                        if (error) {
                            _global.sendError(res. error.message);
                            return connection.rollback(function() {
                                throw error;
                            });
                        }
                        console.log('success adding teacher!');
                        res.send({ result: 'success', message: 'Teacher Added Successfully' });
                    });
                });*/
                //check user role
                if (user.role_id == _global.role.student) {
                    connection.beginTransaction(function(error) {
                        if (error) {
                            _global.sendError(res, error.message);
                            throw error;
                        }
                        connection.release();
                    });
                } else if (user.role_id == _global.role.teacher) {
                    connection.beginTransaction(function(error) {
                        if (error) {
                            _global.sendError(res, error.message);
                            throw error;
                        }
                        connection.release();
                    });
                } else {
                    //user is staff
                    connection.beginTransaction(function(error) {
                        if (error) {
                            _global.sendError(res, error.message);
                            throw error;
                        }
                        connection.release();
                    });
                }
            });
    });
});

router.post('/change-password', function(req, res, next) {
    if (req.body.current_password == null || req.body.current_password == '') {
        _global.sendError(res, null, "current_password is  required");
        return;
    }
    if (req.body.new_password == null || req.body.new_password == '') {
        _global.sendError(res, null, "new_password is required");
        return;
    }
    if (req.body.confirm_password == null || req.body.confirm_password == '') {
        _global.sendError(res, null, "confirm_password is required");
        return;
    }
    if (req.body.confirm_password != req.body.new_password) {
        _global.sendError(res, null, "confirm_password and new_password must be the same");
        return;
    }
    var user_id = req.decoded.id;
    var current_password = req.body.current_password;
    var new_password = req.body.new_password;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        connection.query(`SELECT password FROM users WHERE id=? LIMIT 1`, user_id, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }

            var password_hash = rows[0].password;
            if (bcrypt.compareSync(current_password, password_hash)) {
                var params = [bcrypt.hashSync(new_password, 10), user_id];
                //update password
                connection.query('UPDATE users SET password = ? WHERE id = ? LIMIT 1', params, function(error, results, fields) {
                    if (error) {
                        return connection.rollback(function() {
                            throw error;
                        });
                    }

                    res.send({ result: 'success', message: 'Password Updated Successfully' });
                    connection.release();
                });
            } else {
                _global.sendError(res, null, "Wrong current password");
                throw "Wrong current password";
            }
        });
    });
});

module.exports = router;
