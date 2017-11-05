var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var async = require("async");

var pool = mysql.createPool(_global.db);

router.post('/list', function(req, res, next) {
    var role_id = req.body.role_id ? req.body.role_id : 0;
    var search_text = req.body.search_text ? req.body.search_text : '';
    var page = req.body.page != null ? req.body.page : _global.default_page;
    var limit = req.body.limit != null ? req.body.limit : _global.detail_limit;
    pool.getConnection(function(error, connection) {
        var query = `SELECT id, title, content, feedbacks.read, created_at , 
            (SELECT CONCAT(users.first_name,' ',users.last_name,'\r\n',users.email) FROM users WHERE users.id = feedbacks.from_id) as _from, 
            (SELECT CONCAT(first_name,' ',last_name) FROM users WHERE users.id = feedbacks.to_id) as _to 
            FROM feedbacks`;
        if(role_id != 0){
            query += ' WHERE type = ' + role_id;
        }
        query += ' ORDER BY feedbacks.read , feedbacks.created_at';
        connection.query(query,function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            var feedbacks = rows;
            for(var i = 0 ; i < feedbacks.length; i++){
                if(feedbacks[i]._to == null){
                    feedbacks[i]._to = 'Giáo vụ';
                }
                if(feedbacks[i]._from == null){
                    feedbacks[i]._from = 'Anonymous';
                }
            }
            var search_list = [];
            if (search_text == null) {
                search_list = feedbacks;
            } else {
                for (var i = 0; i < feedbacks.length; i++) {
                    if (feedbacks[i]._from.toLowerCase().indexOf(search_text.toLowerCase()) != -1 ||
                        feedbacks[i]._to.toLowerCase().indexOf(search_text.toLowerCase()) != -1 ||
                        feedbacks[i].title.toLowerCase().indexOf(search_text.toLowerCase()) != -1) {
                        search_list.push(feedbacks[i]);
                    }
                }
            }
            if (limit != -1) {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    feedbacks: _global.filterListByPage(page, limit, search_list)
                });
            } else {
                res.send({
                    result: 'success',
                    total_items: search_list.length,
                    feedbacks: search_list
                });
            }
            connection.release();
        });
    });
});

router.put('/read', function(req, res, next) {
    if (req.body.feedback_id == undefined || req.body.feedback_id == 0) {
        _global.sendError(res, null, "feedback id is required");
        return;
    }
    var feedback_id = req.body.feedback_id;
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`UPDATE feedbacks SET feedbacks.read = 1 WHERE id = ?`,feedback_id,function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            res.send({ result: 'success'});
            connection.release();
        });
    });
});

router.post('/send', function(req, res, next) {
    if (req.body.title == undefined || req.body.title == '') {
        _global.sendError(res, null, "title is required");
        return;
    }
    if (req.body.content == undefined || req.body.content == '') {
        _global.sendError(res, null, "content is required");
        return;
    }
    var feedback = {
        title: req.body.title,
        content: req.body.content,
        to_id : null,
        from_id : (req.body.isAnonymous ? null : req.decoded.id),
        type : (req.body.isAnonymous ? 3 : (req.decoded.role_id == _global.role.student ? 1 : 2)),
    };
    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }
        connection.query(`INSERT INTO feedbacks SET ?`,feedback,function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }
            res.send({ result: 'success', message: 'Feedback sent successfully'});
            connection.release();
        });
    });
});

router.post('/history', function(req, res, next) {
    var user_id = req.decoded.id;

    pool.getConnection(function(error, connection) {
        if (error) {
            _global.sendError(res, error.message);
            throw error;
        }

        var query = `SELECT id, title, content, feedbacks.read, DATE_FORMAT(created_at, "%d-%m-%Y %H:%i") as time FROM feedbacks WHERE from_id = ? ORDER BY feedbacks.read, feedbacks.created_at DESC LIMIT 10`;

        connection.query(query, user_id, function(error, rows, fields) {
            if (error) {
                _global.sendError(res, error.message);
                throw error;
            }

            res.send({ 
                result: 'success',
                total_items: rows.length,
                list: rows
            });
            connection.release();
        });
    });
});

module.exports = router;
