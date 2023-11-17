const mysql = require("mysql");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "rickandmortyfanhubdb",
});

module.exports = pool;
