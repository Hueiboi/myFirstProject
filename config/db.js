const {Client} = require('pg');

const con = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "Hueiboipg2005@",
    database: "storedb"
})

con.connect()
    .then(() => console.log("Connected to the database"))
    .catch(err => console.error(err));

module.exports = con; //Xuất để sử dụng trong file khác