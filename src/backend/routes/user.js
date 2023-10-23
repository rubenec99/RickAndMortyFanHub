const express = require("express");
const router = express.Router();
const db = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "secret_key"; // ¿Guardar esta clave en un archivo .env o en una variable de ambiente? Para más seguridad.

// Número de rondas para el algoritmo de salting.
// Puede ser ajustado, pero 10 es comúnmente usado en la industria por un equilibrio de seguridad y eficiencia.
const saltRounds = 10;

// Endpoint para registrar un nuevo usuario
router.post("/register", (req, res) => {
  // Desestructurando el cuerpo del request para extraer información del usuario.
  const { first_name, last_name, email, username, password, birth_date } =
    req.body;

  console.log(first_name, last_name, email, username, password, birth_date);

  // Validación para asegurar que la fecha de nacimiento no sea en el futuro.
  const selectedDate = new Date(birth_date);
  const today = new Date();

  if (selectedDate > today) {
    return res
      .status(400)
      .send({ error: "La fecha de nacimiento no puede ser futura." });
  }

  // Proceso de hashing para la contraseña del usuario.
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send({ error: "Error al hashear la contraseña" });
    }

    // Si no hay errores, se inserta el usuario en la base de datos con la contraseña ya hasheada.
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

// Endpoint para verificar si un nombre de usuario ya está en uso
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

// Endpoint para verificar si un email ya está registrado en la base de datos.
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
          expiresIn: "1h", // Expira en 1 hora
        }
      );

      res
        .status(200)
        .send({ success: "Inicio de sesión exitoso", token: token });
    });
  });
});

module.exports = router;
