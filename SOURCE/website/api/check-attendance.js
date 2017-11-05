var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');
var async = require("async");

router.post('/check-list', function(req, res, next) {
    if (req.body.student_id == null || req.body.student_id == 0) {
        _global.sendError(res, null, "student_id is required");
        throw "student_id is required";
    }
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        throw "attendance_id is required";
    }
    var student_id = req.body.student_id;
    var attendance_id = req.body.attendance_id;
    var attendance_type = req.body.attendance_type;
    pool.getConnection(function(error, connection) {
        connection.query(`UPDATE attendance_detail SET attendance_type = ?, attendance_time = ? WHERE attendance_id = ? AND student_id = ?`, [attendance_type, new Date(), attendance_id, student_id], function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, 'error at update attendance_detail');
                return console.log(error.message + ' at update attendance_detail');
            } else {
                res.send({
                    result: 'success',
                });
                connection.release();
            }
        });
    });
});

router.post('/qr-code/:id', function(req, res, next) {
    var attendance_id = req.params['id'];
    if (attendance_id == null || attendance_id == 0) {
        attendance_id = req.body.attendance_id;
        if (attendance_id == null || attendance_id == 0) {
            _global.sendError(res, null, "attendance_id is required");
            throw "attendance_id is required";
        }
    }
    
    var student_id = req.decoded.id;
    pool.getConnection(function(error, connection) {
        async.series([
            //Check attendance id
            function(callback) {
                connection.query(`SELECT * FROM attendance WHERE id = ?`, attendance_id, function(error, results, fields) {
                    if (error) {
                        callback(error.message + ' at check attendance_id');
                    } else {
                        if (results.length == 0) {
                            callback('Invalid attendance id');
                        } else {
                            if(results[0].closed){
                                callback('This attendance is closed');
                            }else{
                                callback();
                            }
                        }
                    }
                });
            },
            //Check student_id
            function(callback) {
                connection.query(`SELECT * FROM class_has_course,attendance,student_enroll_course 
                    WHERE class_has_course.class_id = attendance.class_id AND attendance.course_id = class_has_course.course_id AND student_enroll_course.class_has_course_id = class_has_course.id 
                    AND attendance.id = ? AND student_enroll_course.student_id = ?`, [attendance_id, student_id], function(error, results, fields) {
                    if (error) {
                        callback(error.message + ' at check student_id');
                    } else {
                        if (results.length == 0) {
                            callback('Student did not enrolled in this Course');
                        } else {
                            callback();
                        }
                    }
                });
            },
            //Update attendance detail
            function(callback) {
                connection.query(`UPDATE attendance_detail SET attendance_type = 2, attendance_time = ? WHERE attendance_id = ? AND student_id = ?`, [new Date(), attendance_id, student_id], function(error, results, fields) {
                    if (error) {
                        callback(error.message + ' at update attendance_detail');
                    } else {
                        callback();
                    }
                });
            },
        ], function(error) {
            if (error) {
                _global.sendError(res, null, error);
                console.log(error);
            } else {
                res.send({
                    result: 'success',
                });
                connection.release();
            }
        });
    });
});

module.exports = router;
        