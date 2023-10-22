const express = require("express");
const router = express.Router();
const db = require("../db.js");

router.post("/register", (req, res) => {
  const { first_name, last_name, email, username, password, birth_date } =
    req.body;

  console.log(first_name, last_name, email, username, password, birth_date);

  // Puedes añadir validaciones aquí

  const query =
    "INSERT INTO user (first_name, last_name, email, username, password, birth_date) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [first_name, last_name, email, username, password, birth_date],
    (err, result) => {
      if (err) {
        res.status(500).send({ error: "Error al registrar el usuario" });
      } else {
        res.status(200).send({ success: "Usuario registrado exitosamente" });
      }
    }
  );
});

module.exports = router;
