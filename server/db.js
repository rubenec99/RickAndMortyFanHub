const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "albarregas",
  database: "rickandmortyfanhubdb",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Conexión a la base de datos establecida");

  db.query("SELECT * FROM user", (err, result) => {
    if (err) throw err;

    console.log(result);

    db.end(() => {
      console.log("Conexión a la base de datos cerrada");
    });
  });
});
