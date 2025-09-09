const {Client} = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const con = new Client({
    host: process.env.HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

con.connect()
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error(err));

module.exports = con; //Xuất để sử dụng trong file khác