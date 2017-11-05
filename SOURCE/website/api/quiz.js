var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");
var randomstring = require("randomstring");

var pool = mysql.createPool(_global.db);

var quiz_code_list = [];

router.post('/list', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        throw "Classes id is required";
    }
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    var quiz_list = [];
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT quiz.* FROM quiz,class_has_course 
            WHERE quiz.class_has_course_id = class_has_course.id AND class_has_course.class_id = ? AND
             class_has_course.course_id = ? AND closed = 1`, [class_id, course_id], function(error, quizzes, fields) {
            if (error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            var list = quizzes;
            async.each(list, function(_quiz, callback) {
                connection.query(`SELECT * FROM quiz_questions WHERE quiz_questions.quiz_id = ?`, _quiz.id, function(error, questions, fields) {
                    if (error) {
                        callback(error.message);
                    } else {
                        _quiz['questions'] = [];
                        async.each(questions, function(question, callback) {
                            connection.query(`SELECT quiz_answers.* ,CONCAT(users.first_name,' ',users.last_name) as student_name, students.stud_id as student_code 
                                FROM quiz_answers,students,users 
                                WHERE users.id = students.id AND users.id = quiz_answers.answered_by AND quiz_question_id = ?`, question.id, function(error, answers, fields) {
                                if (error) {
                                    callback(error.message);
                                } else {
                                    question['answers'] = answers.slice();
                                    _quiz['questions'].push(question);
                                    callback();
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error);
                            } else {
                                quiz_list.push(_quiz);
                                callback();
                            }
                        });
                    }
                });
            }, function(error) {
                if (error) {
                    _global.sendError(res, null, error);
                    console.log(error);
                } else {
                    console.log('Get quiz_list successfully-----------------');
                    res.send({
                        result: 'success',
                        quiz_list: quiz_list
                    });
                    connection.release();
                }
            });
        });
    });
});

router.post('/detail', function(req, res, next) {
    if (req.body.quiz_id == null || req.body.quiz_id == 0) {
        _global.sendError(res, null, "quiz_id is required");
        throw "quiz_id is required";
    }
    var quiz_id = req.body.quiz_id;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT * FROM quiz WHERE id = ? LIMIT 1`, quiz_id, function(error, quiz, fields) {
            if (error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            var _quiz = quiz[0];
            connection.query(`SELECT * FROM quiz_questions WHERE quiz_id = ?`, quiz_id, function(error, questions, fields) {
                if (error) {
                    _global.sendError(res, null, error);
                    return console.log(error);
                } else {
                    _quiz['questions'] = questions;
                    console.log('Get quiz detail successfully-----------------');
                    res.send({
                        result: 'success',
                        quiz: _quiz,
                        total_item: questions.length
                    });
                    connection.release();
                }
            });
        });
    });
});

router.post('/opening', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        throw "Classes id is required";
    }
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    var quiz_list = [];
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT quiz.* FROM quiz,class_has_course 
            WHERE quiz.class_has_course_id = class_has_course.id AND class_has_course.class_id = ? AND
             class_has_course.course_id = ? AND quiz.closed = 0`, [class_id, course_id], function(error, quizzes, fields) {
            if (error) {
                _global.sendError(res, error.message);
                return console.log(error);
            }
            var list = quizzes;
            async.each(list, function(_quiz, callback) {
                connection.query(`SELECT * FROM quiz_questions WHERE quiz_questions.quiz_id = ?`, _quiz.id, function(error, questions, fields) {
                    if (error) {
                        callback(error.message);
                    } else {
                        _quiz['questions'] = [];
                        async.each(questions, function(question, callback) {
                            connection.query(`SELECT quiz_answers.* ,CONCAT(users.first_name,' ',users.last_name) as student_name, students.stud_id as student_code 
                                FROM quiz_answers,students,users 
                                WHERE users.id = students.id AND users.id = quiz_answers.answered_by AND quiz_question_id = ?`, question.id, function(error, answers, fields) {
                                if (error) {
                                    callback(error.message);
                                } else {
                                    question['answers'] = answers.slice();
                                    _quiz['questions'].push(question);
                                    callback();
                                }
                            });
                        }, function(error) {
                            if (error) {
                                callback(error);
                            } else {
                                quiz_list.push(_quiz);
                                callback();
                            }
                        });
                    }
                });
            }, function(error) {
                if (error) {
                    _global.sendError(res, null, error);
                    console.log(error);
                } else {
                    console.log('Get quiz_list successfully-----------------');
                    res.send({
                        result: 'success',
                        quiz: quiz_list[0]
                    });
                    connection.release();
                }
            });
        });
    });
});

router.post('/start', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        throw "Classes id is required";
    }
    if (req.body.quiz == null || req.body.quiz.length == 0) {
        _global.sendError(res, null, "Quiz is required");
        throw "Quiz is required";
    }
    if (req.body.quiz.title == null || req.body.quiz.title == '') {
        _global.sendError(res, null, "Quiz title id is required");
        throw "Quiz title id is required";
    }
    if (req.body.quiz.questions == null || req.body.quiz.questions.length == 0) {
        _global.sendError(res, null, "Quiz questions are required");
        throw "Quiz questions are required";
    }
    var quiz = req.body.quiz;
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    for (var i = 0; i < quiz.questions.length; i++) {
        if (req.body.quiz.questions[i].text == null || req.body.quiz.questions[i].text == '') {
            _global.sendError(res, null, "Title of question " + (i + 1) + " are required");
            throw "Title of question " + (i + 1) + " are required";
        }
    }
    var class_has_course_id = 0;
    var quiz_id = 0;
    var quiz_code = randomstring.generate({
        length: 5,
        capitalization: 'uppercase',
        charset: 'numeric'
    });
    pool.getConnection(function(error, connection) {
        if (quiz.code == null) {
            var temp = quiz.timer.split(':');
            var seconds = (+temp[0] * 60 + (+temp[1])) * 1000;
            connection.query(`UPDATE quiz SET closed = 0, code = ?,started_at = ? , ended_at = ? WHERE id = ?`, [quiz_code, new Date(), new Date(new Date().getTime() + seconds), quiz.id], function(error, results, fields) {
                if (error) {
                    _global.sendError(res, error.message);
                    return console.log(error);
                } else {
                    console.log('success start quiz---------------------------------------1');
                    res.send({ result: 'success', quiz_id: quiz.id, code: quiz_code, message: 'Start quiz successfully' });
                    return;
                }
            });
        } else {
            async.series([
                //Start transaction
                function(callback) {
                    connection.beginTransaction(function(error) {
                        if (error) callback(error);
                        else callback();
                    });
                },
                //get class_has_course id
                function(callback) {
                    connection.query(`SELECT id FROM class_has_course WHERE class_id = ? AND course_id = ?`, [class_id, course_id], function(error, results, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            class_has_course_id = results[0].id;
                            callback();
                        }
                    });
                },
                //insert quiz
                function(callback) {
                    var new_quiz = {};
                    if (quiz.is_use_timer) {
                        var temp = quiz.timer.split(':');
                        var seconds = (+temp[0] * 60 + (+temp[1])) * 1000;
                        new_quiz = {
                            title: quiz.title,
                            class_has_course_id: class_has_course_id,
                            closed: 0,
                            started_at: new Date(),
                            ended_at: new Date(new Date().getTime() + seconds),
                            timer: quiz.timer,
                            is_use_timer: quiz.is_use_timer,
                            code: quiz_code
                        };
                    } else {
                        new_quiz = {
                            title: quiz.title,
                            class_has_course_id: class_has_course_id,
                            closed: 0,
                            started_at: new Date(),
                            timer: quiz.timer,
                            is_use_timer: quiz.is_use_timer,
                            code: quiz_code
                        };
                    }
                    connection.query(`INSERT INTO quiz SET ?`, new_quiz, function(error, results, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            quiz_id = results.insertId;
                            callback();
                        }
                    });
                },
                //insert questions
                function(callback) {
                    var new_questions = [];
                    for (var i = 0; i < quiz.questions.length; i++) {
                        new_questions.push([quiz_id, quiz.questions[i].text]);
                    }
                    connection.query(`INSERT INTO quiz_questions (quiz_id,text) VALUES ?`, [new_questions], function(error, results, fields) {
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
                    _global.sendError(res, error.message);
                    connection.rollback(function() {
                        return console.log(error);
                    });
                    return console.log(error);
                } else {
                    console.log('success start quiz---------------------------------------2');
                    res.send({ result: 'success', quiz_id: quiz_id, code: quiz_code, message: 'Start quiz successfully' });
                }
            });
        }
    });
});

router.post('/stop', function(req, res, next) {
    if (req.body.quiz_id == null || req.body.quiz_id == 0) {
        _global.sendError(res, null, "quiz_id is required");
        throw "quiz_id is required";
    }
    var quiz_id = req.body.quiz_id;
    pool.getConnection(function(error, connection) {
        connection.query(`UPDATE quiz SET closed = 1, ended_at = ? WHERE id = ?`, [new Date(), quiz_id], function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, error.message);
                throw error;
            } else {
                console.log('success stop quiz---------------------------------------');
                res.send({ result: 'success', message: 'Stop quiz successfully' });
                connection.release();
            }
        });
    });
});

router.post('/check-code', function(req, res, next) {
    if (req.body.code == null || req.body.code == '') {
        _global.sendError(res, null, "Quiz code is required");
        throw "Quiz code is required";
    }
    var student_id = req.decoded.id;
    var code = req.body.code;
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT id,class_has_course_id FROM quiz WHERE code = ? AND closed = 0 LIMIT 1`, code, function(error, results, fields) {
            if (error) {
                _global.sendError(res, null, error.message);
                throw error;
            } else {
                if (results.length == 0) {
                    _global.sendError(res, null, 'Invalid code! It might have been expired or the quiz is already closed');
                    connection.release();
                    return console.log('Invalid code! It might have been expired or the quiz is already closed');
                } else {
                    connection.query(`SELECT * FROM quiz,quiz_questions,quiz_answers 
                        WHERE quiz.id = quiz_questions.quiz_id AND quiz_questions.id = quiz_answers.quiz_question_id AND quiz_id = ? AND quiz_answers.answered_by = ?`, [results[0].id, student_id], function(error, result, fields) {
                        if (error) {
                            _global.sendError(res, null, error.message);
                            throw error;
                        } else {
                            if (result.length == 0) {
                                connection.query(`SELECT * FROM student_enroll_course WHERE class_has_course_id = ? AND student_id = ?`, [results[0].class_has_course_id, student_id], function(error, result, fields) {
                                    if (error) {
                                        _global.sendError(res, null, error.message);
                                        throw error;
                                    } else {
                                        if (result.length == 0) {
                                            _global.sendError(res, null, 'You are not in this course');
                                            connection.release();
                                            return console.log('You are not in this course');
                                        } else {
                                            console.log('success check quiz code---------------------------------------');
                                            res.send({ result: 'success', quiz_id: results[0].id, message: 'check quiz successfully' });
                                            connection.release();
                                        }
                                    }
                                });
                            } else {
                                _global.sendError(res, null, 'You already took this quiz');
                                connection.release();
                                return console.log('You already took this quiz');
                            }
                        }
                    });
                }
            }
        });
    });
});

router.post('/submit', function(req, res, next) {
    if (req.body.student_id == null || req.body.student_id == 0) {
        _global.sendError(res, null, "student_id is required");
        throw "student_id is required";
    }
    if (req.body.quiz == null) {
        _global.sendError(res, null, "Quiz is required");
        throw "Quiz is required";
    }
    if (req.body.quiz.questions == null || req.body.quiz.questions.length == 0) {
        _global.sendError(res, null, "Questions is required");
        throw "Questions is required";
    }
    var quiz = req.body.quiz;
    var student_id = req.body.student_id;
    for (var i = 0; i < quiz.questions.length; i++) {
        if (req.body.quiz.questions[i].answer == null || req.body.quiz.questions[i].answer == '') {
            _global.sendError(res, null, "Answer for question " + (i + 1) + " are required");
            throw "Answer for question " + (i + 1) + " are required";
        }
    }
    var attendance_id = 0;
    var check_attendance_exist = false;
    pool.getConnection(function(error, connection) {
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //insert quiz_answers
            function(callback) {
                var answers = [];
                for (var i = 0; i < quiz.questions.length; i++) {
                    answers.push([quiz.questions[i].id, student_id, quiz.questions[i].answer, new Date()]);
                }
                connection.query(`INSERT INTO quiz_answers (quiz_question_id,answered_by,text,answered_at) VALUES ?`, [answers], function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //insert attendance_id
            function(callback) {
                connection.query(`SELECT attendance.id 
                    FROM quiz,class_has_course,attendance 
                    WHERE quiz.class_has_course_id = class_has_course.id AND class_has_course.class_id = attendance.class_id 
                    AND class_has_course.course_id = class_has_course.course_id AND attendance.closed = 0 AND quiz.id = ?`, quiz.id, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        attendance_id = results[0].id;
                        callback();
                    }
                });
            },
            //check if attendance_detail exist
            function(callback) {
                connection.query(`SELECT * FROM attendance_detail WHERE attendance_id = ? AND student_id = ?`, [attendance_id, student_id], function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        if (results.length == 0) {
                            check_attendance_exist = false;
                        } else {
                            check_attendance_exist = true;
                        }
                        callback();
                    }
                });
            },
            //insert attendance_detail
            function(callback) {
                if (check_attendance_exist) {
                    connection.query(`UPDATE attendance_detail SET attendance_type = ? WHERE attendance_id = ? AND student_id = ?`, [_global.attendance_type.quiz, attendance_id, student_id], function(error, results, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            callback();
                        }
                    });
                } else {
                    var attendance_detail = {
                        attendance_id: attendance_id,
                        student_id: student_id,
                        attendance_time: new Date(),
                        attendance_type: _global.attendance_type.quiz,
                    }
                    connection.query(`INSERT INTO attendance_detail SET ?`, attendance_detail, function(error, results, fields) {
                        if (error) {
                            callback(error);
                        } else {
                            callback();
                        }
                    });
                }
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
                console.log('success submit quiz---------------------------------------');
                res.send({ result: 'success', message: 'Submit quiz successfully' });
            }
        });
    });
});

router.post('/delete', function(req, res, next) {
    if (req.body.quiz_id == null || req.body.quiz_id == 0) {
        _global.sendError(res, null, "quiz_id is required");
        throw "quiz_id is required";
    }
    var quiz_id = req.body.quiz_id;
    pool.getConnection(function(error, connection) {
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //delete Answers
            function(callback) {
                connection.query(`SELECT id FROM quiz_questions WHERE quiz_id = ?`, quiz_id, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        async.each(results, function(question, callback) {
                            connection.query(`DELETE FROM quiz_answers WHERE quiz_question_id = ?`, question.id, function(error, results, fields) {
                                if (error) {
                                    callback(error.message);
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
                    }
                });
            },
            //delete Questions
            function(callback) {
                connection.query(`DELETE FROM quiz_questions WHERE quiz_id = ?`, quiz_id, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //Delete quiz
            function(callback) {
                connection.query(`DELETE FROM quiz WHERE id = ?`, quiz_id, function(error, results, fields) {
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
                _global.sendError(res, error.message);
                connection.rollback(function() {
                    return console.log(error);
                });
                return console.log(error);
                connection.release();
            } else {
                console.log('success delete quiz---------------------------------------');
                res.send({ result: 'success', message: 'Delete quiz successfully' });
                connection.release();
            }
        });
    });
});

router.post('/add', function(req, res, next) {
    if (req.body.course_id == null || req.body.course_id == 0) {
        _global.sendError(res, null, "Course_id is required");
        throw "Course_id is required";
    }
    if (req.body.class_id == null || req.body.class_id == 0) {
        _global.sendError(res, null, "Classes id is required");
        throw "Classes id is required";
    }
    if (req.body.quiz == null || req.body.quiz.length == 0) {
        _global.sendError(res, null, "Quiz is required");
        throw "Quiz is required";
    }
    if (req.body.quiz.title == null || req.body.quiz.title == '') {
        _global.sendError(res, null, "Quiz title id is required");
        throw "Quiz title id is required";
    }
    if (req.body.quiz.questions == null || req.body.quiz.questions.length == 0) {
        _global.sendError(res, null, "Quiz questions are required");
        throw "Quiz questions are required";
    }
    var quiz = req.body.quiz;
    var class_id = req.body.class_id;
    var course_id = req.body.course_id;
    for (var i = 0; i < quiz.questions.length; i++) {
        if (req.body.quiz.questions[i].text == null || req.body.quiz.questions[i].text == '') {
            _global.sendError(res, null, "Title of question " + (i + 1) + " are required");
            throw "Title of question " + (i + 1) + " are required";
        }
    }
    var class_has_course_id = 0;
    var quiz_id = 0;
    var quiz_code = '';
    pool.getConnection(function(error, connection) {
        async.series([
            //Start transaction
            function(callback) {
                connection.beginTransaction(function(error) {
                    if (error) callback(error);
                    else callback();
                });
            },
            //get class_has_course id
            function(callback) {
                connection.query(`SELECT id FROM class_has_course WHERE class_id = ? AND course_id = ?`, [class_id, course_id], function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        class_has_course_id = results[0].id;
                        callback();
                    }
                });
            },
            //insert quiz
            function(callback) {
                var new_quiz = {
                    title: quiz.title,
                    class_has_course_id: class_has_course_id,
                    closed: 1,
                };
                connection.query(`INSERT INTO quiz SET ?`, new_quiz, function(error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        quiz_id = results.insertId;
                        callback();
                    }
                });
            },
            //insert questions
            function(callback) {
                var new_questions = [];
                for (var i = 0; i < quiz.questions.length; i++) {
                    new_questions.push([quiz_id, quiz.questions[i].text]);
                }
                connection.query(`INSERT INTO quiz_questions (quiz_id,text) VALUES ?`, [new_questions], function(error, results, fields) {
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
                _global.sendError(res, error.message);
                connection.rollback(function() {
                    throw error;
                });
                throw error;
            } else {
                console.log('success add quiz---------------------------------------');
                res.send({ result: 'success', message: 'Add quiz successfully' });
            }
        });
    });
});

module.exports = router;
