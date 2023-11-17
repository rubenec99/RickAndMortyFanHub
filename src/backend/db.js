const mysql = require("mysql");

const pool = mysql.createPool({
  host: "srv1049.hstgr.io",
  user: "u496649649_admin",
  password: "~>1s+LT1yH",
  database: "u496649649_RickAndMorty",
  port: 3306,
});

module.exports = pool;
