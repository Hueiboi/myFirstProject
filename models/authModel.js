const con = require('../config/db');

const usersModel = {//ID trong usersTable là serial nên sẽ tự động tăng mỗi khi có 1 row mới
    findByUsername: (username) =>{
        return con.query('select * from "usersTable" where username = $1', [username]);
    },
    createUser: (username, passwordHash) => {
        return con.query('insert into "usersTable" (username, password, role) values ($1, $2, $3) returning *', [username, passwordHash, role]);
    }
}

module.exports = usersModel;