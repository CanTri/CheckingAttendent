var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var jwt = require('jsonwebtoken');
var async = require("async");

router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, _global.jwt_secret_key, function(error, decoded) {
            if (error) {
                //return res.json(error);
                if(error.name == 'TokenExpiredError'){
                    return res.status(401).send({
                        success: false,
                        message: error.message
                    });
                }
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

router.use('/teacher', require('./teacher'));
router.use('/absence-request', require('./absence-request'));
router.use('/student', require('./student'));
router.use('/schedule', require('./schedule'));
router.use('/course', require('./course'));
router.use('/attendance', require('./attendance'));
router.use('/user', require('./user'));
router.use('/semester', require('./semester'));
router.use('/feedback', require('./feedback'));
router.use('/check-attendance', require('./check-attendance'));
router.use('/quiz', require('./quiz'));

router.get('/semesters-programs-classes', function(req, res, next) {
    var program_id = req.body.program_id;
    var class_id = req.body.class_id;
    var semester_id = req.body.semester_id;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT * FROM semesters`, function(error, rows, fields) {
            var semesters = rows;
            connection.query(`SELECT * FROM programs`, function(error, rows, fields) {
                var programs = rows;
                connection.query(`SELECT * FROM classes`, function(error, rows, fields) {
                    var classes = rows;
                    res.send({ result: 'success', semesters: semesters, programs: programs, classes: classes });
                    connection.release();
                    if (error) throw error;
                });
                if (error) throw error;
            });
            if (error) throw error;
        });
    });
});
router.post('/semester/create', function(req, res, next) {
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.start_date == undefined || req.body.start_date == 0) {
        _global.sendError(res, null, "Start date is required");
        return;
    }
    if (req.body.end_date == undefined || req.body.end_date == 0) {
        _global.sendError(res, null, "End date is required");
        return;
    }
    var semester = {
        name: req.body.name,
        start_date: req.body.start_date,
        end_date : req.body.end_date,
        vacation_time : req.body.vacation_time,
    };
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`SELECT * FROM semesters WHERE name = ?`,semester.name,function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            if(rows.length > 0){
                _global.sendError(res, null, "Semester's existed");
                throw error;
            }else{
                connection.query(`INSERT INTO semesters SET ?`,semester,function(error, rows, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        throw error;
                    }
                    res.send({ result: 'success', message: 'Semester added successfully'});
                    connection.release();
                });
            }
        });
    });
});
//Chưa có add file student
router.post('/class/create', function(req, res, next) {
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.email == undefined || req.body.email == 0) {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    var _class = {
        name: req.body.name,
        email: req.body.email,
        program_id : req.body.program_id
    };
    var student_list = req.body.student_list;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`SELECT * FROM classes WHERE name = ?`,_class.name,function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            if(rows.length > 0){
                _global.sendError(res, null, "Class's existed");
                throw error;
            }else{
                connection.query(`INSERT INTO classes SET ?`,_class,function(error, rows, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        throw error;
                    }
                    var class_id = rows.insertId;
                    if(student_list == undefined || student_list == []){
                        res.send({ result: 'success', message: 'Class added successfully'});
                        connection.release();
                    }else{
                        async.each(student_list, function(student, callback) {
                            connection.query(`SELECT id FROM students WHERE stud_id = ? LIMIT 1`, student.stud_id, function(error, results, fields) {
                                if (error) {
                                    console.log(error.message + ' at get student_id from datbase (file)');
                                    callback(error);
                                } else {
                                    if(results.length == 0){
                                        //new student to system
                                        var new_user = {
                                            first_name: _global.getFirstName(student.name),
                                            last_name: _global.getLastName(student.name),
                                            email: student.stud_id + '@student.hcmus.edu.vn',
                                            phone: student.phone,
                                            role_id: 1,
                                            password: bcrypt.hashSync(student.stud_id.toString(), 10),
                                        };
                                        connection.query(`INSERT INTO users SET ?`, new_user, function(error, results, fields) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                var student_id = results.insertId;
                                                var new_student = {
                                                    id: student_id,
                                                    stud_id: student.stud_id,
                                                    class_id: class_id,
                                                }
                                                connection.query(`INSERT INTO students SET ?`, new_student, function(error, results, fields) {
                                                    if (error) {
                                                        callback(error);
                                                    } else {
                                                        callback();
                                                    }
                                                });
                                            }
                                        });
                                    }else{
                                        //old student => ignore
                                        callback();
                                    }
                                }
                            });
                        }, function(error) {
                            if (error) {
                                _global.sendError(res, error.message,'Error at add student to class from file');
                                throw error;
                            }
                            else {
                                res.send({ result: 'success', message: 'Class added successfully'});
                                connection.release();
                            }
                        });
                    }
                });
            }
        });
    });
});
router.post('/program/create', function(req, res, next) {
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.code == undefined || req.body.start_date == 0) {
        _global.sendError(res, null, "Code is required");
        return;
    }
    var program = {
        name: req.body.name,
        code: req.body.code
    };
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`SELECT * FROM programs WHERE code = ? OR name = ?`,[program.code,program.name],function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            if(rows.length > 0){
                _global.sendError(res, null, "Program's existed");
                throw error;
            }else{
                connection.query(`INSERT INTO programs SET ?`,program,function(error, rows, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        throw error;
                    }
                    res.send({ result: 'success', message: 'Program added successfully'});
                    connection.release();
                });
            }
        });
    });
});

module.exports = router;
