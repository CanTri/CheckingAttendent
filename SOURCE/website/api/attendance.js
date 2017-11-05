var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');
var async = require("async");
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");

var delegate_list = [];

router.post('/list-by-course', function(req, res, next) {
    if (req.body.course_id == null) {
        _global.sendError(res, null, "Course id is required");
        throw "Course_id is required";
    }
    if (req.body.classes_id == null || req.body.classes_id.length == 0) {
        _global.sendError(res, null, "Classes id is required");
        throw "Classes id is required";
    }
    var course_id = req.body.course_id;
    var classes_id = req.body.classes_id;
    pool.getConnection(function(error, connection) {
        var attendance_lists = [];
        async.each(classes_id, function(class_id, callback) {
            connection.query(`SELECT students.id, students.stud_id as code, CONCAT(users.first_name, ' ', users.last_name) AS name 
            FROM users,student_enroll_course,students,class_has_course 
            WHERE users.id = students.id AND users.id = student_enroll_course.student_id AND student_enroll_course.class_has_course_id = class_has_course.id AND class_has_course.course_id = ? AND class_has_course.class_id = ?`, [course_id, class_id], function(error, rows, fields) {
                if (error) {
                    var message = error.message + ' at get student_list by course';
                    _global.sendError(res, message);
                    throw message;
                }
                var student_list = rows;
                var attendance_list = [];
                async.each(student_list, function(student, callback) {
                    var attendance = {
                        id: student.id,
                        code: student.code,
                        name: student.name,
                        attendance_details: []
                    };
                    connection.query(`SELECT attendance_detail.attendance_id, attendance_time, attendance_type, created_at 
                        FROM attendance, attendance_detail 
                        WHERE attendance.closed = 1 AND attendance.id = attendance_detail.attendance_id AND  course_id = ? AND student_id = ?`, [course_id, student.id], function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at get attendance_details');
                            callback(error);
                        } else {
                            for (var i = 0; i < results.length; i++) {
                                attendance.attendance_details.push({
                                    attendance_id: results[i].attendance_id,
                                    attendance_time: results[i].attendance_time,
                                    attendance_type: results[i].attendance_type,
                                    created_at: results[i].created_at
                                });
                            }
                            attendance_list.push(attendance);
                            callback();
                        }
                    });
                }, function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        throw error;
                    } else {
                        attendance_lists.push(attendance_list);
                        callback();
                    }
                });
            });
        }, function(error) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            } else {
                console.log('loaded attendance_list');
                res.send({
                    result: 'success',
                    attendance_lists: attendance_lists
                });
            }
            connection.release();
        });

    });
});

//use by staff
router.post('/check-add-to-course', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.student_code == null || req.body.student_code == '') {
        _global.sendError(res, null, "Student code is required");
        throw "Student code is required";
    }
    if (isNaN(req.body.student_code)) {
        _global.sendError(res, null, "Student code must contain only numbers");
        return;
    }
    if (req.body.student_name == null || req.body.student_name == '') {
        _global.sendError(res, null, "Student name is required");
        throw "Student name is required";
    }

    var course_id = req.body.course_id;
    var student_code = req.body.student_code;
    var student_name = req.body.student_name;


    pool.getConnection(function(error, connection) {
        connection.query(`SELECT students.stud_id 
            FROM attendance,attendance_detail, students 
            WHERE attendance.id = attendance_detail.attendance_id AND attendance_detail.student_id = students.id AND attendance.course_id = ? AND students.stud_id = ?`, [course_id, student_code], function(error, rows, fields) {
            if (error) {
                var message = error.message + ' at get check add to course';
                _global.sendError(res, message);
                throw message;
            }
            if (rows.length > 0) {
                _global.sendError(res, null, 'Student code found in attendance list');
            } else {
                res.send({
                    result: 'success'
                });
            }
            connection.release();
        });
    });
});

//use by staff
router.post('/update-list-by-course', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.classes_id == null || req.body.classes_id.length == 0) {
        _global.sendError(res, null, "classes is required");
        throw "classes is required";
    }
    if (req.body.attendance_lists == null) {
        _global.sendError(res, null, "Attendance Lists is required");
        throw "Attendance Lists is required";
    }
    var course_id = req.body.course_id;
    var classes_id = req.body.classes_id;
    var attendance_lists = req.body.attendance_lists;
    for (var i = 0; i < attendance_lists.length; i++) {
        for (var j = 0; j < attendance_lists[i].length; j++) {
            if (attendance_lists[i][j].name == '') {
                _global.sendError(res, null, "Student name is required");
                throw "Student name is required";
            }
        }
    }

    pool.getConnection(function(error, connection) {
        connection.query(`SELECT name FROM courses WHERE id = ? LIMIT 1`, course_id, function(error, rows, fields) {
            if (error) {
                var message = error.message + ' at check valid course';
                _global.sendError(res, message);
                throw message;
            }
            if (rows.length == 0) {
                _global.sendError(res, null, 'Course not found!');
            } else {
                async.series([
                    //Start transaction
                    function(callback) {
                        connection.beginTransaction(function(error) {
                            if (error) callback(error);
                            else callback();
                        });
                    },
                    //Check student info to update or create
                    function(callback) {
                        async.eachOf(attendance_lists, function(attendance_list, index, callback) {
                            async.each(attendance_list, function(student, callback) {
                                async.series([
                                    //Check student info to update or create
                                    function(callback) {
                                        if (student.id == 0) {
                                            //new student to list
                                            connection.query(`SELECT id FROM students WHERE stud_id = ? LIMIT 1`, student.code, function(error, results, fields) {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    if (results.length == 0) {
                                                        //Not exist in system
                                                        var new_user = {
                                                            email: student.code + '@student.hcmus.edu.vn',
                                                            role_id: 1,
                                                            password: bcrypt.hashSync(student.code, 10),
                                                        };
                                                        connection.query(`INSERT INTO users SET ?`, new_user, function(error, results, fields) {
                                                            if (error) {
                                                                callback(error);
                                                            } else {
                                                                student.id = results.insertId;
                                                                var new_student = {
                                                                    id: results.insertId,
                                                                    stud_id: student.code,
                                                                    class_id: classes_id[index],
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
                                                    } else {
                                                        //Exist in system
                                                        //Get class_has_course_id
                                                        student.id = results[0].id;
                                                        connection.query(`SELECT id FROM class_has_course WHERE class_id = ? AND course_id = ? LIMIT 1`, [classes_id[index], course_id], function(error, results, fields) {
                                                            if (error) {
                                                                callback(error);
                                                            } else {
                                                                var insert_student_enroll_course = {
                                                                    class_has_course_id: results[0].id,
                                                                    student_id: student.id
                                                                };
                                                                connection.query(`INSERT INTO student_enroll_course SET ?`, insert_student_enroll_course, function(error, results, fields) {
                                                                    if (error) {
                                                                        callback(error);
                                                                    } else {
                                                                        callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        } else {
                                            callback();
                                        }
                                    },
                                    function(callback) {
                                        //update student info
                                        connection.query(`SELECT * FROM users WHERE id = ? LIMIT 1`, student.id, function(error, results, fields) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                if (results.length == 0) {
                                                    var error = { message: 'Invalid student id : ' + student.id };
                                                    callback(error);
                                                } else {
                                                    connection.query(`UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`, [_global.getFirstName(student.name), _global.getLastName(student.name), student.id], function(error, results, fields) {
                                                        if (error) {
                                                            callback(error);
                                                        } else {
                                                            callback();
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    },
                                    //update attendance details by class + course
                                    function(callback) {
                                        var insert_attendance_detail = [];
                                        for (var i = 0; i < student.attendance_details.length; i++) {
                                            var temp = [
                                                student.attendance_details[i].attendance_id,
                                                student.id,
                                                student.attendance_details[i].attendance_type,
                                                student.attendance_details[i].attendance_time,
                                            ];
                                            insert_attendance_detail.push(temp);
                                        }
                                        async.each(student.attendance_details, function(attendance_detail, callback) {
                                            connection.query(`SELECT * FROM attendance_detail WHERE attendance_id = ? AND student_id = ?`, [attendance_detail.attendance_id, student.id], function(error, results, fields) {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    //for new student
                                                    if (results.length == 0) {
                                                        var temp = {
                                                            attendance_id: attendance_detail.attendance_id,
                                                            student_id: student.id,
                                                            attendance_type: attendance_detail.attendance_type,
                                                            attendance_time: attendance_detail.attendance_time,
                                                        };
                                                        connection.query(`INSERT INTO attendance_detail SET ?`, temp, function(error, results, fields) {
                                                            if (error) {
                                                                callback(error);
                                                            } else {
                                                                callback();
                                                            }
                                                        });
                                                    } else {
                                                        connection.query(`UPDATE attendance_detail SET attendance_time = ?, attendance_type = ?, edited_by = ? WHERE attendance_id = ? AND student_id = ?`, [attendance_detail.attendance_time, attendance_detail.attendance_type,req.decoded.id,attendance_detail.attendance_id, student.id], function(error, results, fields) {
                                                            if (error) {
                                                                callback(error);
                                                            } else {
                                                                callback();
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        }, function(error) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                console.log('updated attendance details for one student');
                                                callback();
                                            }
                                        });
                                    },
                                ], function(error) {
                                    if (error) {
                                        callback(error);
                                    } else {
                                        callback();
                                    }
                                });
                            }, function(error) {
                                if (error) {
                                    callback(error);
                                } else {
                                    console.log('updated attendance_list');
                                    callback();
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error);
                            } else {
                                console.log('updated attendance_lists');
                                callback();
                            }
                        });
                    },
                    //Commit transaction
                    function(callback) {
                        connection.commit(function(error) {
                            if (error) callback(error);
                            else callback();
                        });
                    },
                ], function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        connection.rollback(function() {
                            throw error;
                        });
                        throw error;
                    } else {
                        console.log('success updating attendance list by course!---------------------------------------');
                        res.send({ result: 'success', message: 'Attendance list updated successfully' });
                    }
                });
            }
            connection.release();
        });
    });
});

router.post('/opening-by-teacher', function(req, res, next) {
    if (req.body.teacher_id == null || req.body.teacher_id == 0) {
        _global.sendError(res, null, "teacher_id is required");
        throw "teacher_id is required";
    }
    var teacher_id = req.body.teacher_id;
    var isMobile = req.body.isMobile == null ? 0 : 1;
    pool.getConnection(function(error, connection) {
        var query = `SELECT attendance.*, courses.name as course_name,
         courses.code as course_code, classes.name as class_name,
         teacher_teach_course.* , class_has_course.total_stud, class_has_course.id as class_has_course_id
            FROM attendance, teacher_teach_course, courses, classes, class_has_course
            WHERE attendance.closed = 0 AND attendance.course_id = teacher_teach_course.course_id AND 
                attendance.course_id = courses.id AND attendance.class_id = classes.id AND
                class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND
                teacher_teach_course.teacher_id = ?`;

        if (isMobile) {
            query = `SELECT class_has_course.id as class_has_course_id, attendance.id as attendance_id
            FROM attendance, teacher_teach_course, courses, classes, class_has_course
            WHERE attendance.closed = 0 AND attendance.course_id = teacher_teach_course.course_id AND 
                attendance.course_id = courses.id AND attendance.class_id = classes.id AND
                class_has_course.class_id = classes.id AND class_has_course.course_id = courses.id AND
                teacher_teach_course.teacher_id = ?`;
        }

        connection.query(query, teacher_id, function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get opening attendances');
                return console.log(error.message + ' at get opening attendances');
            } else {
                res.send({
                    result: 'success',
                    length: results.length,
                    opening_attendances: results
                });
                connection.release();
            }
        });
    });
});

router.post('/create', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "course_id is required");
        throw "course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "class_id is required");
        throw "class_id is required";
    }
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    var attendance = {
        course_id: course_id,
        class_id: class_id,
        created_by: req.decoded.id
    };
    pool.getConnection(function(error, connection) {
        connection.query(`INSERT INTO attendance SET ?`, attendance, function(error, inserted, fields) {
            if (error) {
                _global.sendError(res, null, 'error at create attendances');
                return console.log(error.message + ' at create attendances');
            } else {
                connection.query(`SELECT student_id FROM student_enroll_course,class_has_course,attendance 
                    WHERE student_enroll_course.class_has_course_id = class_has_course.id AND attendance.course_id = class_has_course.course_id 
                    AND attendance.class_id = class_has_course.class_id 
                    AND attendance.course_id = ? AND attendance.class_id = ? 
                    GROUP BY student_enroll_course.student_id `, [course_id, class_id], function(error, results, fields) {
                    if (error) {
                        _global.sendError(res, null, 'error at get student in attendances');
                        return console.log(error.message + ' at get student in attendances');
                    } else {
                        async.each(results, function(student, callback) {
                            var attendance_detail = {
                                attendance_id: inserted.insertId,
                                student_id: student.student_id
                            };
                            connection.query(`INSERT INTO attendance_detail SET ?`, attendance_detail, function(error, results, fields) {
                                if (error) {
                                    console.log(error.message + ' at insert attendance_details');
                                    callback(error);
                                } else {
                                    callback();
                                }
                            });
                        }, function(error) {
                            if (error) {
                                _global.sendError(res, error.message);
                                throw error;
                            } else {
                                console.log('insert attendance_details');
                                res.send({ result: 'success', attendance_id: inserted.insertId });
                                connection.release();
                            }
                        });
                    }
                });
            }
        });
    });
});

router.post('/delete', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        throw "attendance_id is required";
    }
    var attendance_id = req.body.attendance_id;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT course_id , class_id FROM attendance WHERE id = ?`, attendance_id, function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get attendances info');
                throw (error.message + ' at get attendances info');
            } else {
                for (var i = 0; i < delegate_list.length; i++) {
                    if (delegate_list[i]['course_id'] == results[0].course_id && delegate_list[i]['class_id'] == results[0].class_id) {
                        delegate_list.splice(i, 1);
                        break;
                    }
                }
                connection.query(`DELETE FROM attendance WHERE id = ?`, attendance_id, function(error, results, fields) {
                    if (error) {
                        _global.sendError(res, null, 'error at delete attendances');
                        throw (error.message + ' at delete attendances');
                    } else {
                        res.send({ result: 'success' });
                        connection.release();
                    }
                });
            }
        });
    });
});

router.post('/close', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        throw "attendance_id is required";
    }
    var attendance_id = req.body.attendance_id;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT course_id , class_id FROM attendance WHERE id = ?`, attendance_id, function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get attendances info');
                throw (error.message + ' at get attendances info');
            } else {
                for (var i = 0; i < delegate_list.length; i++) {
                    if (delegate_list[i]['course_id'] == results[0].course_id && delegate_list[i]['class_id'] == results[0].class_id) {
                        delegate_list.splice(i, 1);
                        break;
                    }
                }
                connection.query(`UPDATE attendance SET closed = 1 WHERE id = ?`, attendance_id, function(error, results, fields) {
                    if (error) {
                        _global.sendError(res, null, 'error at close attendances');
                        throw (error.message + ' at close attendances');
                    } else {
                        //send email for the absent
                        connection.query(`SELECT users.*, courses.code as course_code, courses.name as course_name, attendance.course_id, attendance.class_id 
                            FROM courses,attendance,attendance_detail, users 
                            WHERE attendance_id = ? AND attendance_type = ? AND users.id = student_id AND attendance.id = attendance_id AND
                            courses.id = attendance.course_id`, [attendance_id, _global.attendance_type.absent], function(error, students, fields) {
                            if (error) {
                                _global.sendError(res, null, 'error at get absent students to send mail');
                                throw (error.message + ' at get absent students to send mail');
                            } else {
                                let transporter = nodemailer.createTransport(_global.email_setting);
                                async.each(students, function(student, callback) {
                                    //count absences and total attendance
                                    connection.query(`SELECT COUNT(*) as count, attendance_type FROM attendance,attendance_detail 
                                                WHERE id = attendance_id AND student_id = ? AND course_id = ? AND class_id = ? 
                                                GROUP BY attendance_type`, [student.id, student.course_id, student.class_id], function(error, results, fields) {
                                        if (error) {
                                            console.log(error.message + ' at insert attendance_details');
                                            callback(error);
                                        } else {
                                            var total = 0;
                                            var absence = 0;
                                            for (var i = 0; i < results.length; i++) {
                                                if (results[i].attendance_type == _global.attendance_type.absent) absence = results[i].count;
                                                total += results[i].count;
                                            }
                                            let mailOptions = {
                                                from: '"Giáo vụ" <giaovu.clc@fit.hcmus.edu.vn>', // sender address
                                                to: student.email, // list of receivers
                                                subject: 'Update on your absence from ' + student.course_code + '-' + student.course_name, // Subject line
                                                text: `Hi ` + student.last_name + `,\r\n\r\n Today, you were absent from the class ` + student.course_code + '-' + student.course_name + `.Currently, your absence/total is ` + absence + `/` + total + ` (` + Math.floor(100 * absence / total) + `%).` + `Please be aware that if you exceed 30% of the total attendance, you won't be able to attend the final exam.\r\n\r\n If you need help, please contact giaovu.clc@fit.hcmus.edu.vn`,
                                            };
                                            transporter.sendMail(mailOptions, (error, info) => {
                                                if (error) {
                                                    callback(error);
                                                } else {
                                                    console.log(mailOptions);

                                                }
                                            });
                                            callback();
                                        }
                                    });
                                }, function(error) {
                                    if (error) {
                                        _global.sendError(res, error.message);
                                        throw error;
                                    } else {
                                        console.log('sent all mails');
                                        res.send({ result: 'success' });
                                        connection.release();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

router.post('/check-attendance-list', function(req, res, next) {
    var listOnlyFlag = req.body.islistOnly == null ? 0 : 1;

    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Class id is required");
        throw "Class id is required";
    }
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT students.id, students.stud_id as code, CONCAT(users.first_name, ' ', users.last_name) AS name 
            FROM users,student_enroll_course,students,class_has_course 
            WHERE users.id = students.id AND users.id = student_enroll_course.student_id AND student_enroll_course.class_has_course_id = class_has_course.id AND class_has_course.course_id = ? AND class_has_course.class_id = ?`, [course_id, class_id], function(error, rows, fields) {
            if (error) {
                var message = error.message + ' at get student_list by course';
                _global.sendError(res, message);
                throw message;
            }
            var student_list = rows;
            var check_attendance_list = [];
            async.each(student_list, function(student, callback) {
                var attendance = {
                    id: student.id,
                    code: student.code,
                    name: student.name,
                    attendance_details: []
                };

                if (listOnlyFlag) {
                    check_attendance_list.push(attendance);
                    callback();
                } else {
                    connection.query(`SELECT attendance_detail.attendance_id, attendance_time, attendance_type FROM attendance, attendance_detail 
                        WHERE attendance.id = attendance_detail.attendance_id AND  course_id = ? AND student_id = ?`, [course_id, student.id], function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at get check_attendance_details');
                            callback(error);
                        } else {
                            for (var i = 0; i < results.length; i++) {
                                attendance.attendance_details.push({
                                    attendance_id: results[i].attendance_id,
                                    attendance_time: results[i].attendance_time,
                                    attendance_type: results[i].attendance_type
                                });
                            }
                            check_attendance_list.push(attendance);
                            callback();
                        }
                    });
                }
            }, function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                } else {
                    console.log('loaded check_attendance_list');
                    res.send({
                        result: 'success',
                        length: check_attendance_list.length,
                        check_attendance_list: check_attendance_list
                    });
                    connection.release();
                }
            });
        });

    });
});

router.post('/check-attendance', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        throw "attendance_id is required";
    }

    var attendance_id = req.body.attendance_id;
    pool.getConnection(function(error, connection) {
        if (error) {
            var message = error.message + ' at get student_list by course';
            _global.sendError(res, message);
            throw message;
        }

        connection.query(`SELECT students.id as id, students.stud_id as code, CONCAT(users.first_name, ' ', users.last_name) AS name, attendance_detail.attendance_type as status 
            FROM users, attendance_detail, students 
            WHERE users.id = students.id
            AND attendance_detail.student_id = students.id
            AND attendance_detail.attendance_id = ?`, [attendance_id], function(error, rows, fields) {

            if (error) {
                var message = error.message + ' at get student_list by course';
                _global.sendError(res, message);
                throw message;
            }

            console.log('loaded check_attendance_list');

            res.send({
                result: 'success',
                length: rows.length,
                check_attendance_list: rows
            });

            connection.release();
        });

    });
});

router.post('/update-attendance', function(req, res, next) {
    if (req.body.attendance_id == null || req.body.attendance_id == 0) {
        _global.sendError(res, null, "attendance_id is required");
        throw "attendance_id is required";
    }

    var attendance_id = req.body.attendance_id;
    pool.getConnection(function(error, connection) {
        if (error) {
            var message = error.message + ' at get attendance data by course';
            _global.sendError(res, message);
            throw message;
        }

        var attendance_detail = req.body.data;

        async.each(attendance_detail, function(detail, callback) {
            connection.query(`UPDATE attendance_detail
                SET attendance_detail.attendance_type = ?, attendance_detail.attendance_time = ?
                WHERE attendance_detail.student_id = ? AND attendance_detail.attendance_id = ?`, [detail.status, new Date(),
                detail.student_id, attendance_id
            ], function(error, results, fields) {
                if (error) {
                    console.log(error.message + ' at get attendance_details');
                    callback(error);
                } else {
                    callback();
                }
            });
        }, function(error) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            } else {
                res.send({ result: "success" });
                connection.release();
            }
        });
    });
});

router.post('/update-attendance-offline', function(req, res, next) {
    if (req.body.data == null || req.body.data.length == 0) {
        _global.sendError(res, null, "attendance detail is required");
        throw "attendance detail is required";
    }
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "course id is required");
        throw "course id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "class id is required");
        throw "class id is required";
    }

    var attendance_id = 0;
    var attendance_detail = req.body.data;
    pool.getConnection(function(error, connection) {
        var new_attendance = {
            course_id: course_id,
            classes_id: class_id,
            created_by: req.decoded.id,
        }
        connection.query(`INSERT INTO attendance SET ? `, new_attendance, function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, "error at insert new attendance");
                connection.release();
                return console.log(error.message + ' at insert new attendance');
            } else {
                attendance_id = results.insertId;
                var new_attendance_details = [];
                for(var i = 0 ; i < attendance_detail.length; i++){
                    new_attendance_details.push([
                        attendance_id,
                        attendance_detail[i].student_id,
                        attendance_detail[i].status,
                        attendance_detail[i].time
                        ]);
                }
                connection.query(`INSERT INTO attendance_detail (attendance_id,student_id,attendance_type,attendance_time) VALUES ?`, [new_attendance_details], function(error, results, fields) {
                    if (error) {
                        _global.sendError(res, null, "error at insert new attendance_details");
                        connection.release();
                        return console.log(error.message + ' at insert new attendance_details');
                    } else {
                        res.send({ result: "success" });
                        connection.release();
                    }
                });
            }
        });
    });
});

router.post('/list-by-student/', function(req, res, next) {
    if (req.body.student_id == null) {
        _global.sendError(res, null, "student_id is required");
        throw "student_id is required";
    }
    var student_id = req.body.student_id;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT courses.code, courses.name , courses.id , class_has_course.attendance_count, class_has_course.class_id 
                FROM users,student_enroll_course,class_has_course ,courses 
                WHERE users.id = ? AND users.id = student_enroll_course.student_id AND student_enroll_course.class_has_course_id = class_has_course.id 
                    AND class_has_course.course_id = courses.id AND courses.semester_id = (SELECT MAX(id) FROM semesters)`, student_id, function(error, rows, fields) {
            if (error) {
                var message = error.message + ' at get enrolling courses by student';
                _global.sendError(res, message);
                throw message;
            }
            var course_list = rows;
            var attendance_list_by_student = [];
            async.each(course_list, function(course, callback) {
                var attendance = {
                    id: course.id,
                    code: course.code,
                    name: course.name,
                    class_id: course.class_id,
                    attendance_count: course.attendance_count,
                    attendance_details: []
                };
                connection.query(`SELECT attendance_detail.attendance_id, attendance_time, attendance_type ,created_at
                    FROM attendance, attendance_detail 
                    WHERE attendance.closed = 1 AND attendance.id = attendance_detail.attendance_id AND course_id = ? AND class_id = ? AND student_id = ? `, [course.id, course.class_id, student_id], function(error, results, fields) {
                    if (error) {
                        console.log(error.message + ' at get attendance_details by student');
                        callback(error);
                    } else {
                        for (var i = 0; i < results.length; i++) {
                            attendance.attendance_details.push({
                                attendance_id: results[i].attendance_id,
                                attendance_time: results[i].attendance_time,
                                attendance_type: results[i].attendance_type,
                                created_at: results[i].created_at
                            });
                        }
                        attendance_list_by_student.push(attendance);
                        callback();
                    }
                });
            }, function(error) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                } else {
                    console.log('loaded attendance_list_by_student');
                    res.send({
                        result: 'success',
                        attendance_list_by_student: attendance_list_by_student
                    });
                }
            });
        });
    });
});

router.post('/generate-delegate-code', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Class id is required");
        throw "Class id is required";
    }
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    pool.getConnection(function(error, connection) {
        //check attendance is opening or not ?
        connection.query(`SELECT * FROM attendance WHERE course_id = ? AND class_id = ? AND closed = 0`, [course_id, class_id], function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, 'error at check  attendance opening or not');
                return console.log(error.message + ' at check  attendance opening or not');
            } else {
                if (results.length == 0) {
                    _global.sendError(res, null, 'This course doesnt have any opening attendance');
                    console.log('This course doesnt have any opening attendance');
                } else {
                    var code = randomstring.generate({
                        length: 5,
                        capitalization: 'uppercase',
                        charset: 'numeric'
                    });
                    for (var i = 0; i < delegate_list.length; i++) {
                        if (delegate_list[i]['course_id'] == course_id && delegate_list[i]['class_id'] == class_id) {
                            delegate_list[i]['code'] = code;
                            delegate_list[i]['in_use'] = false;
                            res.send({
                                result: 'success',
                                code: code
                            });
                            connection.release();
                            return;
                        }
                    }
                    delegate_list.push({
                        code: code,
                        course_id: course_id,
                        class_id: class_id,
                        attendance_id: results[0].id,
                        in_use: false,
                        created_by: req.decoded.id,
                    });
                    res.send({
                        result: 'success',
                        code: code
                    });
                }
                connection.release();
            }
        });
    });
});

router.post('/check-delegate-code', function(req, res, next) {
    if (req.body.code == null || req.body.code == '') {
        _global.sendError(res, null, "Delegate code is required");
        throw "Delegate code is required";
    }
    var code = req.body.code;
    for (var i = 0; i < delegate_list.length; i++) {
        if (delegate_list[i]['code'] == code) {
            // if (delegate_list[i]['in_use'] == true) {
            //     _global.sendError(res, null, 'This code is being used!');
            //     console.log('This code is being used!');
            //     return;
            // } else {
            //     delegate_list[i]['in_use'] = true;
            //     res.send({
            //         result: 'success',
            //         delegate_detail: delegate_list[i]
            //     });
            //     return;
            // }
            res.send({
                result: 'success',
                delegate_detail: delegate_list[i]
            });
            return;
        }
    }
    _global.sendError(res, null, 'Invalid code! It might have been expired or the attendance is already closed');
    console.log('Invalid code! It might have been expired or the attendance is already closed');
});

router.post('/opening-for-student', function(req, res, next) {
    var student_id = req.decoded.id;
    pool.getConnection(function(error, connection) {
        if (error) {
            var message = error.message + ' at get attendance data for student';
            _global.sendError(res, message);
            throw message;
        }

        query = `SELECT class_has_course.id as class_has_course_id, attendance.id as attendance_id
            FROM qldd.attendance, class_has_course, student_enroll_course as sec
            WHERE attendance.closed = 0 AND
            class_has_course.class_id = attendance.class_id 
            AND class_has_course.course_id = attendance.course_id
            AND sec.class_has_course_id = class_has_course.id
            AND sec.student_id = ?`;

        connection.query(query, student_id, function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, 'error at get opening attendances');
                return console.log(error.message + ' at get opening attendances');
            } else {
                res.send({
                    result: 'success',
                    length: results.length,
                    opening_attendances: results
                });
                connection.release();
            }
        });
    });
});

module.exports = router;
