module.exports = {
    db: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'qldd'
    },
    //db_postgres: {
    //    host: 'ec2-54-247-166-129.eu-west-1.compute.amazonaws.com',
    //    user: 'jrfgjdydwutqqq',
    //    password: '6596b2752d1eba4e8e6793b4aef3d7424b75ecc5354dcf299fb003ca80aff764',
    //    port:'5432',
    //    database: 'dfgju67jiv9q22'
    //},
    db_postgres: {
         host: 'localhost',
         user: 'postgres',
         password: '1234',
         port:'5432',
         database: 'qldd'
     },
    host: 'localhost:3000',
    email_setting: {
        host: 'smtp.office365.com', // Office 365 server
        port: 587, // secure SMTP
        secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: {
            user: '1353019@student.hcmus.edu.vn',
            pass: 'Nghia1507'
        },
        tls: {
            ciphers: 'SSLv3'
        }
    },
    attendance_type:{
        absent: 0,
        checklist: 1,
        qr: 2,
        quiz: 3,
        face: 4
    },
    attendance_status:{
        normal: 0,
        exemption: 1,
    },
    role: {
        admin: 0,
        student: 1,
        teacher: 2,
        staff: 3,
    },
    absence_request_status: {
        new: 0,
        accepted: 1,
        rejected: 2
    },

    jwt_secret_key: '13530191353049',
    jwt_expire_time: '1d',
    jwt_reset_password_expire_time: 30 * 60,

    default_page: 1,
    default_limit: 10,

    lecturer_role: 0,
    ta_role: 1,

    api_ver: 1,

    sendError: function(res, detail = null, message = "Server error") {
        res.send({ result: 'failure', detail: detail, message: message });
    },

    filterListByPage: function(page, limit, list) {
        var result = [];
        var length = list.length;
        if (length < limit) {
            return list;
        } else {
            if (page * limit > length) {
                for (var i = (page - 1) * limit; i < length; i++) {
                    result.push(list[i]);
                }
            } else {
                for (var i = (page - 1) * limit; i < page * limit; i++) {
                    result.push(list[i]);
                }
            }
            return result;
        }
    },

    sortListByKey: function(order, list, key) {
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < list.length; j++) {
                var value1 = list[i][key].toString().toLowerCase();
                var value2 = list[j][key].toString().toLowerCase();
                if (order == 'dsc' && value1 > value2 || order == 'asc' && value1 < value2) {
                    var temp = list[i];
                    list[i] = list[j];
                    list[j] = temp;
                }
            }
        }
    },

    getFirstName: function(name) {
        var i = name.lastIndexOf(' ');
        var first_name = name.substr(0, i);
        return first_name;
    },

    getLastName: function(name) {
        var i = name.lastIndexOf(' ');
        var last_name = name.substr(i + 1, name.length - 1);
        return last_name;
    },

    getProgramCodeFromClassName: function(class_name) {
        var program_code = '';
        for (var i = 0; i < class_name.length; i++) {
            if (isNaN(class_name[i])) {
                program_code += class_name[i];
            }
        }
        return program_code;
    },
    
    removeExtraFromTeacherName: function(teacher_name) {
        var name = teacher_name;
        //cắt học vị
        var i = name.indexOf('. ');
        if (i != -1) {
            name = name.substr(i + 1, name.length - 1);
        }
        //cắt (+TA)
        i = name.lastIndexOf('(');
        if (i != -1) {
            name = name.substr(0, i - 1);
        }
        return name;
    }
};
