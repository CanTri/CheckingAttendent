var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");

var connection = mysql.createConnection(_global.db);
var pool = mysql.createPool(_global.db);
var bcrypt = require('bcrypt');
var teacher_list = [];

router.get('/detail/:id', function(req, res, next) {
    var id = req.params['id'];
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT courses.*,semesters.name as semester_name, semesters.id as semester_id,programs.name as program_name,
                            (semesters.id - (SELECT MAX(id) FROM semesters)) as not_in_current_semester
            FROM courses,semesters,programs 
            WHERE programs.id = courses.program_id AND courses.id = ? AND courses.semester_id = semesters.id LIMIT 1`, id, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            var course = rows[0];
            connection.query(`SELECT * FROM users,teacher_teach_course
                WHERE users.id = teacher_teach_course.teacher_id AND teacher_teach_course.course_id = ?`, id, function(error, rows, fields) {
                if (error) {
                    var message = error.message + ' at get lecturers/TAs';
                    _global.sendError(res, message);
                    throw message;
                }
                var lecturers = [];
                var TAs = [];
                for (var i = 0; i < rows.length; i++) {
                    if (rows[i].teacher_role == 0) {
                        lecturers.push(rows[i]);
                    } else {
                        TAs.push(rows[i]);
                    }
                }
                connection.query(`SELECT class_id, classes.name as class_name, classes.email as class_email,class_has_course.course_id ,schedules , total_stud
                    FROM classes,class_has_course 
                    WHERE course_id = ? AND classes.id = class_has_course.class_id `, id, function(error, rows, fields) {
                    if (error) {
                        var message = error.message + ' at get schedule';
                        _global.sendError(res, message);
                        throw message;
                    }
                    res.send({ result: 'success', course: course, lecturers: lecturers, TAs: TAs, class_has_course: rows });
                    connection.release();
                });
            });
        });
    });
});

router.post('/list', function(req, res, next) {
    var searchText = req.body.searchText;
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    var sort = req.body.sort != null ? req.body.sort : 'none';

    var program_id = req.body.program_id != null ? req.body.program_id : 1;
    var class_id = req.body.class_id != null ? req.body.class_id : 0;
    var semester_id = req.body.semester_id != null ? req.body.semester_id : 0;
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

            course_list = rows;
            var search_list = [];
            if (searchText == null) {
                search_list = course_list;
            } else {
                for (var i = 0; i < course_list.length; i++) {
                    if (course_list[i].code.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].lecturers.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(course_list[i]);
                    }
                }
            }
            if (sort != 'none') {
                _global.sortListByKey(sort, search_list, 'last_name');
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    courses: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    courses: search_list
                });
            }

            connection.release();
        };
        var query = `SELECT courses.id,courses.code,courses.name,attendance_count,total_stud, courses.note,courses.office_hour,
                                (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs,
                                classes.name as class_name 
                        FROM courses, class_has_course, classes
                        WHERE class_has_course.course_id = courses.id AND classes.id = class_has_course.class_id AND courses.program_id = ?`;
        if (class_id != 0) {
            query += ' AND class_has_course.class_id = ' + class_id;
        }
        if (semester_id != 0) {
            query += ' AND courses.semester_id = ' + semester_id;
        }
        //query += ' GROUP BY courses.code ORDER BY courses.id';
        connection.query(query, program_id, return_function);
    });
});

router.post('/add', function(req, res, next) {
    if (req.body.code === undefined || req.body.code == '') {
        _global.sendError(res, null, "Course code is required");
        return;
    }
    if (req.body.name === undefined || req.body.name == '') {
        _global.sendError(res, null, "Course name is required");
        return;
    }
    if (req.body.lecturers === undefined || req.body.lecturers.length == 0) {
        _global.sendError(res, null, "Lecturers is required");
        return;
    }
    if (req.body.program_id === undefined || req.body.program_id == 0) {
        _global.sendError(res, null, "Program is required");
        return;
    }
    if (req.body.classes === undefined) {
        _global.sendError(res, null, "Class is required");
        return;
    }
    for (var i = 0; i < req.body.classes.length; i++) {
        if (parseInt(req.body.classes[i].classId) == 0) {
            _global.sendError(res, null, "Class is required");
            return;
        }
        if (req.body.classes[i].schedule == '') {
            _global.sendError(res, null, "Schedule is required");
            return;
        }
    }
    var new_name = req.body.name;
    var new_code = req.body.code;
    var new_lecturers = req.body.lecturers;
    var new_TAs = req.body.TAs === undefined ? [] : req.body.TAs;
    var new_program_id = req.body.program_id;
    var new_note = req.body.note === undefined ? null : req.body.note;
    var new_office_hour = req.body.office_hour === undefined ? null : req.body.office_hour;

    var new_classes = req.body.classes;
    var new_schedules = req.body.schedule;
    // _global.sendError(res, null, "test");
    // return;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`SELECT id FROM courses WHERE code=? AND semester_id = (SELECT MAX(id) FROM semesters)  LIMIT 1`, new_code, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            //check course with same code in the same semester exist
            if (rows.length > 0) {
                _global.sendError(res, null, "The course already existed this semester");
                throw "The course already existed this semester";
            }
            console.log('start adding course!---------------------------------------');
            connection.query(`SELECT MAX(id) as id FROM semesters`, function(error, rows, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    throw error;
                }
                var new_course = {
                    code: new_code,
                    name: new_name,
                    semester_id: rows[0].id,
                    program_id: new_program_id,
                    note: new_note,
                    office_hour: new_office_hour,
                };
                var new_course_id;

                async.series([
                    //Start transaction
                    function(callback) {
                        connection.beginTransaction(function(error) {
                            if (error) callback(error);
                            else callback();
                        });
                    },
                    //Insert new Course
                    function(callback) {
                        connection.query(`INSERT INTO courses SET ?`, new_course, function(error, results, fields) {
                            if (error) {
                                console.log('insert courses error');
                                callback(error);
                            } else {
                                new_course_id = results.insertId;
                                callback();
                            }
                        });
                    },
                    //Insert teacher_teach_course
                    function(callback) {
                        var new_teacher_teach_course = [];
                        //// Lecturers
                        for (var i = 0; i < new_lecturers.length; i++) {
                            var temp = [];
                            temp.push(new_lecturers[i].id);
                            temp.push(new_course_id);
                            temp.push(_global.lecturer_role);
                            new_teacher_teach_course.push(temp);
                        }
                        //// TAs
                        for (var i = 0; i < new_TAs.length; i++) {
                            var temp = [];
                            temp.push(new_TAs[i].id);
                            temp.push(new_course_id);
                            temp.push(_global.ta_role);
                            new_teacher_teach_course.push(temp);
                        }
                        connection.query(`INSERT INTO teacher_teach_course (teacher_id,course_id,teacher_role) VALUES ?`, [new_teacher_teach_course], function(error, results, fields) {
                            if (error) {
                                console.log(error.message + ' at insert teacher_teach_course');
                                callback(error);
                            } else {
                                console.log('inserted teacher_teach_course');
                                callback();
                            }
                        });
                    },
                    //Insert class_has_course
                    function(callback) {
                        // var new_class_has_course_list = [];
                        // for (var i = 0; i < new_classes.length; i++) {
                        //     var class_has_course = {
                        //         class_id: new_classes[i].classId,
                        //         course_id: new_course_id,
                        //         schedules: new_classes[i].schedule
                        //     };
                        //     new_class_has_course_list.push(class_has_course);
                        // }

                        async.each(new_classes, function(_class, callback) {
                            var class_has_course = {
                                class_id: _class.classId,
                                course_id: new_course_id,
                                schedules: _class.schedule
                            };
                            connection.query(`INSERT INTO class_has_course SET ?`, class_has_course, function(error, results, fields) {
                                if (error) {
                                    console.log(error.message + ' at insert class_has_course');
                                    callback(error);
                                } else {
                                    var class_has_course_id = results.insertId;
                                    var new_student_enroll_course = [];
                                    async.series([
                                        //get student from class
                                        function(callback) {
                                            if (_class.isAddStudentFromCLass) {
                                                connection.query(`SELECT id FROM students WHERE class_id = ?`, _class.classId, function(error, results, fields) {
                                                    if (error) {
                                                        console.log(error.message + ' at get students from class');
                                                        callback(error);
                                                    } else {
                                                        for (var i = 0; i < results.length; i++) {
                                                            var temp = [];
                                                            temp.push(class_has_course_id);
                                                            temp.push(results[i].id);
                                                            new_student_enroll_course.push(temp);
                                                        }
                                                        callback();
                                                    }
                                                });
                                            } else callback();
                                        },
                                        //get student from file
                                        function(callback) {
                                            if (_class.studentListFromFile.length > 0) {
                                                async.each(_class.studentListFromFile, function(student, callback) {
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
                                                                    password: bcrypt.hashSync(student.code, 10),
                                                                };
                                                                connection.query(`INSERT INTO users SET ?`, new_user, function(error, results, fields) {
                                                                    if (error) {
                                                                        callback(error);
                                                                    } else {
                                                                        var student_id = results.insertId;
                                                                        var new_student = {
                                                                            id: student_id,
                                                                            stud_id: student.stud_id,
                                                                            class_id: _class.classId,
                                                                        }
                                                                        connection.query(`INSERT INTO students SET ?`, new_student, function(error, results, fields) {
                                                                            if (error) {
                                                                                callback(error);
                                                                            } else {
                                                                                var temp = [];
                                                                                temp.push(class_has_course_id);
                                                                                temp.push(student_id);
                                                                                new_student_enroll_course.push(temp);
                                                                                callback();
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                //old student
                                                                var temp = [];
                                                                temp.push(class_has_course_id);
                                                                temp.push(results[0].id);
                                                                new_student_enroll_course.push(temp);
                                                                callback();
                                                            }
                                                        }
                                                    });
                                                }, function(error) {
                                                    if (error) callback(error);
                                                    else callback();
                                                });
                                            } else {
                                                callback();
                                            }
                                        }
                                    ], function(error) {
                                        if (error) {
                                            callback(error);
                                        } else {
                                            console.log(new_student_enroll_course);
                                            connection.query(`INSERT INTO student_enroll_course (class_has_course_id,student_id) VALUES ?`, [new_student_enroll_course], function(error, results, fields) {
                                                if (error) {
                                                    console.log(error.message + ' at insert student_enroll_course');
                                                    callback(error);
                                                } else {
                                                    console.log('inserted student_enroll_course');
                                                    callback();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error);
                            } else {
                                console.log('inserted class_has_course');
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
                        console.log('success adding course!---------------------------------------');
                        res.send({ result: 'success', message: 'Course Added Successfully' });
                    }
                    connection.release();
                });
            });
        });
    });
});

router.post('/edit', function(req, res, next) {
    if (req.body.id === undefined || req.body.id == 0) {
        _global.sendError(res, null, "Course ID is required");
        return;
    }
    if (req.body.code === undefined || req.body.code == '') {
        _global.sendError(res, null, "Course code is required");
        return;
    }
    if (req.body.name === undefined || req.body.name == '') {
        _global.sendError(res, null, "Course name is required");
        return;
    }
    if (req.body.lecturers === undefined || req.body.lecturers.length == 0) {
        _global.sendError(res, null, "Lecturers is required");
        return;
    }
    var course_id = req.body.id;
    var new_name = req.body.name;
    var new_code = req.body.code;
    var new_lecturers = req.body.lecturers;
    var new_TAs = req.body.TAs === undefined ? [] : req.body.TAs;
    var new_note = req.body.note === undefined ? null : req.body.note;
    var new_office_hour = req.body.office_hour === undefined ? null : req.body.office_hour;

    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`SELECT code FROM courses WHERE id = ? LIMIT 1`, course_id, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            //check course with same code in the same semester exist
            if (rows.length == 0) {
                _global.sendError(res, null, "Course not found");
                throw "Course not found";
            }
            console.log('start updating course!---------------------------------------');
            async.series([
                //Start transaction
                function(callback) {
                    connection.beginTransaction(function(error) {
                        if (error) callback(error);
                        else callback();
                    });
                },
                //Insert new Course
                function(callback) {
                    connection.query(`UPDATE courses SET code = ? ,name = ? , note = ? , office_hour = ? WHERE id = ?`, [new_code, new_name, new_note, new_office_hour, course_id], function(error, results, fields) {
                        if (error) {
                            console.log('update courses error');
                            callback(error);
                        } else {
                            callback();
                        }
                    });
                },
                //update teacher_teach_course
                function(callback) {
                    var new_teacher_teach_course = [];
                    //// Lecturers
                    for (var i = 0; i < new_lecturers.length; i++) {
                        var temp = [];
                        temp.push(new_lecturers[i].id);
                        temp.push(course_id);
                        temp.push(_global.lecturer_role);
                        new_teacher_teach_course.push(temp);
                    }
                    //// TAs
                    for (var i = 0; i < new_TAs.length; i++) {
                        var temp = [];
                        temp.push(new_TAs[i].id);
                        temp.push(course_id);
                        temp.push(_global.ta_role);
                        new_teacher_teach_course.push(temp);
                    }
                    connection.query(`DELETE FROM teacher_teach_course WHERE course_id = ?`, course_id, function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at remove old teacher_teach_course');
                            callback(error);
                        } else {
                            console.log('removed old teacher_teach_course');
                            connection.query(`INSERT INTO teacher_teach_course (teacher_id,course_id,teacher_role) VALUES ?`, [new_teacher_teach_course], function(error, results, fields) {
                                if (error) {
                                    console.log(error.message + ' at insert new teacher_teach_course');
                                    callback(error);
                                } else {
                                    console.log('inserted new teacher_teach_course');
                                    callback();
                                }
                            });
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
                    console.log('success updated course!---------------------------------------');
                    res.send({ result: 'success', message: 'Course Updated Successfully' });
                }
                connection.release();
            });
        });
    });
});

router.post('/list/teaching', function(req, res, next) {
    if (req.body.teacher_id === undefined || req.body.teacher_id == 0) {
        _global.sendError(res, null, "Teacher id is required");
        return;
    }
    var teacher_id = req.body.teacher_id;
    var searchText = req.body.searchText;
    var program_id = req.body.program_id != null ? req.body.program_id : 0;
    var class_id = req.body.class_id != null ? req.body.class_id : 0;

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

            course_list = rows;
            var search_list = [];
            if (searchText == null) {
                search_list = course_list;
            } else {
                for (var i = 0; i < course_list.length; i++) {
                    if (course_list[i].code.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].name.toLowerCase().indexOf(searchText.toLowerCase()) != -1 ||
                        course_list[i].lecturers.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
                        search_list.push(course_list[i]);
                    }
                }
            }
            res.send({
                result: 'success',
                courses: search_list
            });

            connection.release();
        };
        var query = `SELECT courses.id,courses.code,courses.name,total_stud,classes.id as class_id,classes.name as class_name, 
                            (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                            FROM teacher_teach_course,users 
                            WHERE users.id = teacher_teach_course.teacher_id AND 
                                courses.id = teacher_teach_course.course_id AND 
                                teacher_teach_course.teacher_role = 0) as lecturers, 
                            (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                            FROM teacher_teach_course,users 
                            WHERE users.id = teacher_teach_course.teacher_id AND 
                                courses.id = teacher_teach_course.course_id AND 
                                teacher_teach_course.teacher_role = 1) as TAs 
                    FROM courses, class_has_course, teacher_teach_course, classes
                    WHERE teacher_teach_course.teacher_id = 1 AND
                        teacher_teach_course.course_id = courses.id AND 
                        class_has_course.course_id = courses.id AND
                        class_has_course.class_id = classes.id AND
                        courses.semester_id = (SELECT MAX(ID) FROM semesters)`;
        if (class_id != 0) {
            query += ' AND class_has_course.class_id = ' + class_id;
        }
        if (program_id != 0) {
            query += ' AND courses.program_id = ' + program_id;
        }
        connection.query(query, program_id, return_function);
    });
});

router.post('/import', function(req, res, next) {
    if (req.body.class_name == undefined || req.body.class_name == '') {
        _global.sendError(res, null, "Class name is required");
        return;
    }
    if (req.body.course_list == undefined || req.body.course_list.length == 0) {
        _global.sendError(res, null, "Course list is required");
        return;
    }
    var class_name = req.body.class_name;
    var course_list = req.body.course_list;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        var class_id = 0;
        var program_id = 0;
        var new_course_id = 0;
        var semester_id = 0;
        var program_code = _global.getProgramCodeFromClassName(class_name);
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //Get semester id
            function(callback) {
                connection.query(`SELECT MAX(id) as id FROM semesters`, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        semester_id = results[0].id;
                        callback();
                    }
                });
            },
            //Get program id
            function(callback) {
                connection.query(`SELECT id FROM programs WHERE UPPER(code) = UPPER(?) LIMIT 1`, program_code, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        if (results.length == 0) {
                            //program not found
                            callback('Program not found');
                        } else {
                            program_id = results[0].id;
                            callback();
                        }
                    }
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
                            var email = class_name.toLowerCase() + '@student.hcmus.edu.vn';
                            var new_class = {
                                name: class_name,
                                email: email,
                                program_id: program_id
                            }
                            connection.query(`INSERT INTO classes SET ?`, new_class, function(error, results, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    class_id = results.insertId;
                                    callback();
                                }
                            });
                        } else {
                            class_id = results[0].id;
                            callback();
                        }
                    }
                });
            },
            //Insert course
            function(callback) {
                async.each(course_list, function(course, callback) {
                    var new_course = {
                        code: course.code,
                        name: course.name,
                        semester_id: semester_id,
                        program_id: program_id,
                        office_hour: course.office_hour,
                        note: course.note,
                    };
                    console.log(new_course);
                    async.series([
                        //insert courses
                        function(callback) {
                            connection.query(`INSERT INTO courses SET ?`, new_course, function(error, results, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    new_course_id = results.insertId;
                                    callback();
                                }
                            });
                        },
                        //insert class_has_course
                        function(callback) {
                            var new_class_has_course = {
                                class_id: class_id,
                                course_id: new_course_id,
                            }
                            connection.query(`INSERT INTO class_has_course SET ?`, new_class_has_course, function(error, results, fields) {
                                if (error) {
                                    callback(error);
                                } else {
                                    callback();
                                }
                            });
                        },
                        //insert teacher_teach_course
                        function(callback) {
                            var teacher_list = [];
                            for (var i = 0; i < course.lecturers.length; i++) {
                                if (course.lecturers[i] == undefined) continue;
                                var name = _global.removeExtraFromTeacherName(course.lecturers[i]);
                                teacher_list.push({
                                    first_name: _global.getFirstName(name),
                                    last_name: _global.getLastName(name),
                                    role: 0
                                });
                            }
                            if (course.TAs != undefined) {
                                for (var i = 0; i < course.TAs.length; i++) {
                                    if (course.TAs[i] == undefined) continue;
                                    var name = _global.removeExtraFromTeacherName(course.TAs[i]);
                                    teacher_list.push({
                                        first_name: _global.getFirstName(name),
                                        last_name: _global.getLastName(name),
                                        role: 1
                                    });
                                }
                            }
                            console.log(teacher_list);
                            async.each(teacher_list, function(teacher, callback) {
                                connection.query(`SELECT users.id FROM users,teachers WHERE users.id = teachers.id AND first_name = ? AND last_name = ? LIMIT 1`, [teacher.first_name, teacher.last_name], function(error, results, fields) {
                                    if (error) {
                                        callback(error);
                                    } else {
                                        if (results.length == 0) {
                                            callback('Teacher' + teacher.first_name + ' ' + teacher.last_name + ' not found');
                                        } else {
                                            var new_teacher_teach_course = {
                                                teacher_id: results[0].id,
                                                teacher_role: teacher.role,
                                                course_id: new_course_id
                                            }
                                            connection.query(`INSERT INTO teacher_teach_course SET ?`, new_teacher_teach_course, function(error, results, fields) {
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
                _global.sendError(res, error.message, error);
                connection.rollback(function() {
                    console.log(error);
                });
                console.log(error);
            } else {
                console.log('success import courses!---------------------------------------');
                res.send({ result: 'success', message: 'Courses imported successfully' });
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
    var course_lists = [];
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
                    connection.query(`SELECT courses.id,courses.code,courses.name,attendance_count,total_stud, courses.note,courses.office_hour,classes.name as class_name,
                                (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 0) as lecturers,
                                (SELECT GROUP_CONCAT( CONCAT(users.first_name,' ',users.last_name) SEPARATOR "\r\n")
                                FROM teacher_teach_course,users 
                                WHERE users.id = teacher_teach_course.teacher_id AND 
                                    courses.id = teacher_teach_course.course_id AND 
                                    teacher_teach_course.teacher_role = 1) as TAs 
                            FROM courses, class_has_course,classes
                            WHERE class_has_course.course_id = courses.id AND class_has_course.class_id = ?  AND classes.id = class_has_course.class_id
                            GROUP BY courses.code ORDER BY courses.id`, class_id, function(error, results, fields) {
                        if (error) {
                            console.log(error.message + ' at get course by class');
                            callback(error);
                        } else {
                            course_lists.push(results);
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
                console.log('success export courses!---------------------------------------');
                res.send({ result: 'success', message: 'Courses exported successfully', course_lists: course_lists });
            }
            connection.release();
        });
    });
});

router.post('/class-has-course', function(req, res, next) {
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`SELECT class_has_course.id,courses.code,courses.name,classes.name as class_name 
                        FROM courses, class_has_course, classes
                        WHERE class_has_course.course_id = courses.id AND classes.id = class_has_course.class_id`, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            res.send({
                result: 'success',
                class_has_course: rows
            });
            connection.release();
        });
    });
});

//API mobile

router.post('/teaching', function(req, res, next) {
    var teacher_id = req.decoded.id;

    if (teacher_id) {
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

                res.send({
                    result: 'success',
                    total_items: rows.length,
                    courses: rows
                });

                connection.release();
            };

            connection.query(`SELECT courses.id, courses.code, courses.name, class_has_course.class_id as class, classes.name as class_name, 
                class_has_course.id as chcid, class_has_course.total_stud as total_stud, class_has_course.schedules as schedule, courses.office_hour, courses.note
                                FROM courses JOIN teacher_teach_course ON course_id = courses.id
                                    JOIN class_has_course on class_has_course.course_id = courses.id
                                    JOIN classes on class_has_course.class_id = classes.id
                                WHERE teacher_id = ? AND
                                    courses.semester_id = (SELECT MAX(ID) FROM semesters)`, [teacher_id], return_function);
        });
    } else {
        return res.status(401).send({
            result: 'failure',
            message: 'teacher_id is required'
        });
    }
});

router.post('/studying', function(req, res, next) {
    var student_id = req.decoded.id;

    if (student_id) {
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

                console.log(rows);

                res.send({
                    result: 'success',
                    total_items: rows.length,
                    courses: rows
                });

                connection.release();
            };

            connection.query(`SELECT courses.id, courses.code, courses.name, class_has_course.class_id as class, classes.name as class_name, 
                class_has_course.id as chcid, class_has_course.total_stud as total_stud, class_has_course.schedules as schedule, courses.office_hour, courses.note 
                                FROM courses JOIN class_has_course ON class_has_course.course_id = courses.id
                                    JOIN classes ON class_has_course.class_id = classes.id
                                    JOIN student_enroll_course ON class_has_course.id = student_enroll_course.class_has_course_id
                                WHERE student_id = ? AND
                                    courses.semester_id = (SELECT MAX(ID) FROM semesters)`, [student_id], return_function);
        });
    } else {
        return res.status(401).send({
            result: 'failure',
            message: 'student_id is required'
        });
    }
});

module.exports = router;
