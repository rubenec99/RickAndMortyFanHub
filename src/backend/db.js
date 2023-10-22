const mysql = require("mysql");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "albarregas",
  database: "rickandmortyfanhubdb",
});

module.exports = pool;
