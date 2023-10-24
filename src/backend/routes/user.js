const express = require("express");
const router = express.Router();
const db = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "secret_key";

// Número de rondas para el algoritmo de salting. Es una práctica estándar usar 10 rondas.
const saltRounds = 10;

/**
 * Endpoint para registrar un nuevo usuario.
 */
router.post("/register", (req, res) => {
  // Desestructura el cuerpo del request para obtener la información del usuario.
  const { first_name, last_name, email, username, password, birth_date } =
    req.body;

  // Validación para asegurarse de que la fecha de nacimiento no sea en el futuro.
  const selectedDate = new Date(birth_date);
  const today = new Date();

  if (selectedDate > today) {
    return res
      .status(400)
      .send({ error: "La fecha de nacimiento no puede ser futura." });
  }

  // Hashing de la contraseña del usuario.
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send({ error: "Error al hashear la contraseña" });
    }

    // Inserta el nuevo usuario en la base de datos.
    const query =
      "INSERT INTO user (first_name, last_name, email, username, password, birth_date) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [first_name, last_name, email, username, hashedPassword, birth_date],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .send({ error: "Error al registrar el usuario" });
        }
        res.status(200).send({ success: "Usuario registrado exitosamente" });
      }
    );
  });
});

/**
 * Endpoint para verificar si un nombre de usuario ya está en uso.
 */
router.post("/check-username", (req, res) => {
  const username = req.body.username;

  const query = "SELECT username FROM user WHERE username = ?";
  db.query(query, [username], (err, result) => {
    if (err) {
      return res
        .status(500)
        .send({ error: "Error al verificar el nombre de usuario" });
    }

    if (result.length > 0) {
      return res.status(200).send({ exists: true });
    } else {
      return res.status(200).send({ exists: false });
    }
  });
});

/**
 * Endpoint para verificar si un email ya está registrado en la base de datos.
 */
router.post("/check-email", (req, res) => {
  const email = req.body.email;

  const query = "SELECT * FROM user WHERE email = ?";
  db.query(query, [email], (err, result) => {
    if (err) {
      return res.status(500).send({ error: "Error al verificar el email" });
    }

    if (result.length > 0) {
      return res.status(200).send({ exists: true });
    } else {
      return res.status(200).send({ exists: false });
    }
  });
});

/**
 * Endpoint para el inicio de sesión del usuario.
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM user WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ error: "Error al verificar el nombre de usuario" });
    }

    if (results.length === 0) {
      return res.status(401).send({ error: "Credenciales inválidas" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res
          .status(500)
          .send({ error: "Error al comparar la contraseña" });
      }

      if (!isMatch) {
        return res.status(401).send({ error: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        {
          expiresIn: "1h", // Token expira en 1 hora
        }
      );

      res
        .status(200)
        .send({ success: "Inicio de sesión exitoso", token: token });
    });
  });
});

module.exports = router;
