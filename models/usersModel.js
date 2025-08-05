const con = require('../config/db');

const usersModel = {
    findByUsername: (username) =>{
        return con.query('select * from "users" where username = $1', [username]);
    },
    createUser: (username, passwordHash) => {
        return con.query('insert into "users" (username, password) values ($1, $2) returning *', (username, passwordHash));
    }
}

module.exports = usersModel;