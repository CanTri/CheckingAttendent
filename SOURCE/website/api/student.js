var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');

router.post('/list', function(req, res, next) {
    var searchText = req.body.searchText;
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    var sort = req.body.sort != null ? req.body.sort : 'none';

    var program_id = req.body.program_id != null ? req.body.program_id : 1;
    var class_id = req.body.class_id != null ? req.body.class_id : 0;
    var status = req.body.status != null ? req.body.status : 0;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        var return_function = function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }

            student_list = rows;
            var search_list = [];
            if (searchText == null) {
                search_list = student_list;
            } else {
                for (var i = 0; i < student_list.length; i++) {
                    if (student_list[i].code.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        student_list[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(student_list[i]);
                    }
                }
            }
            if (sort != 'none') {
                _global.sortListByKey(sort, search_list, 'last_name');
            }
            if (limit == -1) {
                //all
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    student_list: search_list
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    student_list: _global.filterListByPage(page, limit, search_list)
                });
            }

            connection.release();
        };
        if (class_id == 0) {
            connection.query(`SELECT users.id, students.stud_id as code, CONCAT(users.first_name,' ',users.last_name) as name, users.phone, students.status, students.current_courses as enroll_course, classes.name as class_name
                                FROM users,students,classes
                                WHERE users.id = students.id AND classes.id = students.class_id AND classes.program_id = ? AND students.status = ?`, [program_id, status], return_function);
        } else {
            connection.query(`SELECT users.id, students.stud_id as code, CONCAT(users.first_name,' ',users.last_name) as name, users.phone, students.status, students.current_courses as enroll_course, classes.name as class_name
                                FROM users,students,classes
                                WHERE users.id = students.id AND classes.id = students.class_id AND classes.id = ? AND classes.program_id = ? AND students.status = ?`, [class_id, program_id, status], return_function);
        }
    });
});

router.post('/add', function(req, res, next) {
    if (req.body.program_id == undefined || req.body.program_id == 0) {
        _global.sendError(res, null, "Program is required");
        return;
    }
    if (req.body.class_id == undefined || req.body.class_id == 0) {
        _global.sendError(res, null, "Class is required");
        return;
    }
    if (req.body.code == undefined || req.body.code == '') {
        _global.sendError(res, null, "Student code is required");
        return;
    }
    if (req.body.first_name == undefined || req.body.first_name == '') {
        _global.sendError(res, null, "First name is required");
        return;
    }
    if (req.body.last_name == undefined || req.body.last_name == '') {
        _global.sendError(res, null, "Last name is required");
        return;
    }
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    if (req.body.phone == undefined || isNaN(req.body.phone)) {
        _global.sendError(res, null, "Invalid Phone Number");
        return;
    }
    var new_class_id = req.body.class_id;
    var new_program_id = req.body.program_id;
    var new_code = req.body.code;
    var new_first_name = req.body.first_name;
    var new_last_name = req.body.last_name;
    var new_email = req.body.email;
    var new_phone = req.body.phone;
    var new_note = req.body.note;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        connection.query(`SELECT stud_id FROM students WHERE stud_id = ? LIMIT 1`, new_code, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            //check email exist
            if (rows.length > 0) {
                _global.sendError(res, null, "Student code already existed");
                throw "Student code already existed";
            }
            connection.query(`SELECT email FROM users WHERE email=? LIMIT 1`, new_email, function(error, rows, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                }
                //check email exist
                if (rows.length > 0) {
                    _global.sendError(res, "Email already existed")
                    throw "Email already existed";
                }
                //new data to users table
                var new_password = new_email.split('@')[0];
                var new_user = {
                    first_name: new_first_name,
                    last_name: new_last_name,
                    email: new_email,
                    phone: new_phone,
                    password: bcrypt.hashSync(new_password, 10),
                    role_id: 1
                };

                //begin adding user
                connection.beginTransaction(function(error) {
                    if (error) {
                        _global.sendError(res, error.message);
                        throw error;
                    }
                    //add data to user table
                    connection.query('INSERT INTO users SET ?', new_user, function(error, results, fields) {
                        if (error) {
                            _global.sendError(res.error.message);
                            return connection.rollback(function() {
                                throw error;
                            });
                        }
                        //add data to student table
                        var new_student = {
                            id: results.insertId,
                            stud_id: new_code,
                            class_id: new_class_id,
                            note: new_note
                        };
                        connection.query('INSERT INTO students SET ?', new_student, function(error, results, fields) {
                            if (error) {
                                _global.sendError(res.error.message);
                                return connection.rollback(function() {
                                    throw error;
                                });
                            }
                            connection.commit(function(error) {
                                if (error) {
                                    _global.sendError(res.error.message);
                                    return connection.rollback(function() {
                                        throw error;
                                    });
                                }
                                console.log('success adding student!');
                                res.send({ result: 'success', message: 'Student Added Successfully' });
                            });
                        });
                    });
                });
                connection.release();
            })
        });
    });
});

router.get('/detail/:id', function(req, res, next) {
    var id = req.params['id'];
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT users.*,students.stud_id AS code, students.status,classes.id AS class_id ,classes.name AS class_name FROM users,students,classes WHERE users.id = ? AND users.id = students.id AND students.class_id = classes.id  LIMIT 1`, id, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            var student = rows[0];
            connection.query(`SELECT courses.id, code, name, attendance_status, enrollment_status,
                                (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                (SELECT COUNT(attendance_detail.attendance_id) 
                                FROM attendance,attendance_detail 
                                WHERE attendance_detail.student_id = student_enroll_course.student_id AND attendance_detail.attendance_type = -1 AND attendance.course_id = courses.id AND attendance.id = attendance_detail.attendance_id ) as absence_count 
                FROM student_enroll_course,courses,class_has_course
                WHERE student_enroll_course.class_has_course_id = class_has_course.id AND class_has_course.course_id = courses.id AND student_enroll_course.student_id = ?`, id, function(error, rows, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                }
                res.send({ result: 'success', student: student, current_courses: rows });
                connection.release();
            });
        });
    });
});

router.put('/update', function(req, res, next) {
    if (req.body.id == undefined || req.body.id == '') {
        _global.sendError(res, null, "Student code is required");
        return;
    }
    if (req.body.name == undefined || req.body.name == '') {
        _global.sendError(res, null, "Name is required");
        return;
    }
    if (req.body.email == undefined || req.body.email == '') {
        _global.sendError(res, null, "Email is required");
        return;
    }
    if (req.body.email.indexOf('@') == -1) {
        _global.sendError(res, null, "Invalid Email");
        return;
    }
    if (req.body.phone == undefined || isNaN(req.body.phone)) {
        _global.sendError(res, null, "Invalid Phone Number");
        return;
    }
    var user_id = req.body.id;
    var new_last_name = _global.getLastName(req.body.name);
    var new_first_name = _global.getFirstName(req.body.name);
    var new_email = req.body.email;
    var new_phone = req.body.phone;
    var new_status = req.body.status ? req.body.status : 0;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //update Student table
            function(callback) {
                connection.query(`UPDATE students SET status = ? WHERE id = ?`, [new_status, user_id], function(error, results, fields) {
                    if (error) {
                        console.log(error.message + "at Update student's status");
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //update user table
            function(callback) {
                connection.query(`UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?`, [new_first_name, new_last_name, new_email, new_phone, user_id], function(error, results, fields) {
                    if (error) {
                        console.log(error.message + ' at Update Users info');
                        callback(error);
                    } else {
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
                console.log('success updating student!---------------------------------------');
                res.send({ result: 'success', message: 'Student Updated Successfully' });
            }
            connection.release();
        });
    });
});

router.post('/import', function(req, res, next) {
    if (req.body.class_name == undefined || req.body.class_name == '') {
        _global.sendError(res, null, "Class name is required");
        return;
    }
    if (req.body.student_list == undefined || req.body.student_list.length == 0) {
        _global.sendError(res, null, "Student list is required");
        return;
    }
    var class_name = req.body.class_name;
    var student_list = req.body.student_list;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        var class_id = 0;
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //Get class id
            function(callback) {
                connection.query(`SELECT id FROM classes WHERE UPPER(name) = UPPER(?) LIMIT 1`, class_name, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        if (results.length == 0) {
                            //new class => insert
                            var program_code = _global.getProgramCodeFromClassName(class_name);
                            connection.query(`SELECT id FROM programs WHERE UPPER(code) = UPPER(?) LIMIT 1`, program_code, function(error, results, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    if (results.length == 0) {
                                        //program not found
                                        callback({ message: 'Program not found' });
                                    } else {
                                        var email = class_name.toLowerCase() + '@student.hcmus.edu.vn';
                                        var new_class = {
                                            name: class_name,
                                            email: email,
                                            program_id: results[0].id
                                        }
                                        connection.query(`INSERT INTO classes SET ?`, new_class, function(error, results, fields) {
                                            if (error) {
                                                callback(error);
                                            } else {
                                                class_id = results.insertId;
                                                callback();
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            class_id = results[0].id;
                            callback();
                        }
                    }
                });
            },
            //Insert student into class
            function(callback) {
                async.each(student_list, function(student, callback) {
                    connection.query(`SELECT id FROM students WHERE stud_id = ? LIMIT 1`, student.stud_id, function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at get student_id from datbase (file)');
                            callback(error);
                        } else {
                            if (results.length == 0) {
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
                            } else {
                                //old student => ignore
                                callback();
                            }
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
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
                _global.sendError(res, null, error.message);
                connection.rollback(function() {
                    console.log(error);
                });
                console.log(error);
            } else {
                console.log('success import students!---------------------------------------');
                res.send({ result: 'success', message: 'Students imported successfully' });
            }
            connection.release();
        });
    });
});

router.post('/export', function(req, res, next) {
    if (req.body.classes_id == undefined || req.body.classes_id.length == 0) {
        _global.sendError(res, null, "Classes id is required");
        return;
    }
    var classes_id = req.body.classes_id;
    var student_lists = [];
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //get student from each class
            function(callback) {
                async.each(classes_id, function(class_id, callback) {
                    connection.query(`SELECT users.id, students.stud_id as code, CONCAT(users.first_name,' ',users.last_name) as name, users.phone, classes.name as class_name
                                FROM users,students,classes
                                WHERE users.id = students.id AND classes.id = students.class_id AND classes.id = ?`, class_id, function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at get student by class');
                            callback(error);
                        } else {
                            student_lists.push(results);
                            callback();
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
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
                _global.sendError(res, null, error.message);
                connection.rollback(function() {
                    console.log(error);
                });
                console.log(error);
            } else {
                console.log('success export students!---------------------------------------');
                res.send({ result: 'success', message: 'Students exported successfully', student_lists: student_lists });
            }
            connection.release();
        });
    });
});

router.post('/export-examinees', function(req, res, next) {
    if (req.body.class_has_course_id == undefined || req.body.class_has_course_id.length == 0) {
        _global.sendError(res, null, "class_has_course_id is required");
        return;
    }
    var class_has_course_ids = req.body.class_has_course_id;
    var student_lists = [];
    var examinees_lists = [];
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //get student from each class_has_course
            function(callback) {
                async.each(class_has_course_ids, function(class_has_course_id, callback) {
                    connection.query(`SELECT student_enroll_course.*,users.last_name,users.first_name, students.stud_id as student_code, students.id,
                                    class_has_course.class_id, class_has_course.course_id, class_has_course.attendance_count 
                        FROM student_enroll_course,users, students, class_has_course 
                        WHERE class_has_course.id = class_has_course_id AND users.id = student_enroll_course.student_id AND users.id = students.id AND class_has_course_id = ?`, class_has_course_id, function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at get student by class_has_course');
                            callback(error);
                        } else {
                            student_lists.push(results);
                            callback();
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //check student attendance progression from each list
            function(callback) {
                async.eachOf(student_lists, function(student_list, student_list_index, callback) {
                    var examinees_list = [];
                    async.eachOf(student_list, function(student, student_index, callback) {
                        if (student.attendance_status == _global.attendance_status.exemption) {
                            //Sinh viên được miễn điểm danh
                            examinees_list.push(student);
                            callback();
                        } else {
                            //Sinh viên ko được miễn điểm danh
                            //count absences and total attendance
                            connection.query(`SELECT COUNT(*) as count, attendance_type FROM attendance,attendance_detail 
                                WHERE attendance.closed = 1 AND id = attendance_id AND student_id = ? AND course_id = ? AND class_id = ? 
                                GROUP BY attendance_type`, [student.id, student.course_id, student.class_id], function(error, results, fields) {
                                if (error) {
                                    console.log(error.message + ' at count attendance_details');
                                    callback(error);
                                } else {
                                    var total = 0;
                                    var absence = 0;
                                    for (var i = 0; i < results.length; i++) {
                                        if (results[i].attendance_type == _global.attendance_type.absent) absence = results[i].count;
                                        total += results[i].count;
                                    }
                                    console.log(student.student_code + ' ' + absence + ' ' + total);
                                    if(Math.floor(100 * absence / total) <= 30){
                                        examinees_list.push(student);
                                    }
                                    callback();
                                }
                            });
                        }
                    }, function(error) {
                        if (error) {
                            callback(error);
                        } else {
                            examinees_lists.push(examinees_list);
                            callback();
                        }
                    });
                }, function(error) {
                    if (error) {
                        callback(error);
                    } else {
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
                _global.sendError(res, null, error.message);
                connection.rollback(function() {
                    console.log(error);
                });
                console.log(error);
            } else {
                console.log('success export examinees!---------------------------------------');
                res.send({ result: 'success', message: 'Examinees exported successfully', examinees_lists: examinees_lists });
            }
            connection.release();
        });
    });
});

router.post('/detail-by-code', function(req, res, next) {
    if (req.body.code == undefined || req.body.code == '') {
        _global.sendError(res, null, "Student code is required");
        return;
    }
    var student_code = req.body.code;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT * FROM users,students 
            WHERE students.stud_id = ? AND users.id = students.id LIMIT 1`, student_code, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            if (rows.length == 0) {
                res.send({ result: 'failure', message: 'Student not found' });
            } else {
                res.send({ result: 'success', student: rows[0] });
            }
            connection.release();
        });
    });
});

router.post('/change-attendance-status', function(req, res, next) {
    if (req.body.student_id == undefined || req.body.student_id == 0) {
        _global.sendError(res, null, "Student id is required");
        return;
    }
    if (req.body.course_id == undefined || req.body.course_id == 0) {
        _global.sendError(res, null, "course id is required");
        return;
    }
    if (req.body.class_id == undefined || req.body.class_id == 0) {
        _global.sendError(res, null, "class id is required");
        return;
    }
    if (req.body.status == undefined) {
        _global.sendError(res, null, "status is required");
        return;
    }
    var student_id = req.body.student_id;
    var course_id = req.body.course_id;
    var class_id = req.body.class_id;
    var status = req.body.status;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT id FROM class_has_course WHERE class_id = ? AND course_id = ? LIMIT 1`, [class_id, course_id], function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            if (rows.length == 0) {
                res.send({ result: 'failure', message: 'class_has_course not found' });
                connection.release();
                return;
            } else {
                connection.query(`UPDATE student_enroll_course SET attendance_status = ? 
                    WHERE student_id = ? AND class_has_course_id = ?`, [status, student_id, rows[0].id], function(error, rows, fields) {
                    if (error) {
                        _global.sendError(res, error.message);
                        return console.log(error);
                    }
                    res.send({ result: 'success', message: 'Change attendance status successfully' });
                    connection.release();
                });
            }
        });
    });
});

module.exports = router;
