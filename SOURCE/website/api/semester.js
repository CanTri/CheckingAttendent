var express = require('express');
var router = express.Router();
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require("async");

router.get('/:id', function(req, res, next) {
    var id = req.params['id'];
    pool.getConnection(function(error, connection) {
        connection.query(`SELECT * FROM semesters WHERE id = ?`, id, function(error, results, fields) {
            if (error) {
                var message = error.message + ' at get semester info';
                _global.sendError(res, message);
                throw error;
            } else {
                res.send({ result: 'success', semester : results[0]});
            }
            connection.release();
        });
    });
});

module.exports = router;