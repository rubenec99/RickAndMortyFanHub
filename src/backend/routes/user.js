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

/**
 * Endpoint para obtener todos los usuarios.
 */
router.get("/all-users", (req, res) => {
  // Obtiene el límite de usuarios por página desde los parámetros de consulta o usa 15 como valor por defecto.
  const limit = parseInt(req.query.limit) || 15;

  // Calcula el offset (desplazamiento) basado en la página solicitada.
  // Si no se especifica una página, se usa 0 por defecto.
  const offset = (parseInt(req.query.page) || 0) * limit;

  // Obtiene el campo por el cual se ordenarán los usuarios o usa "id" como valor por defecto.
  const sortBy = req.query.sortBy || "id";

  // Obtiene la dirección de ordenamiento (ASC o DESC) o usa "ASC" como valor por defecto.
  const direction = req.query.direction || "ASC";

  const query = `
    SELECT id, first_name, last_name, email, username, user_type, birth_date 
    FROM user 
    ORDER BY ${sortBy} ${direction}
    LIMIT ${limit} OFFSET ${offset}
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ error: "Error al obtener los usuarios" });
    }

    const countQuery = "SELECT COUNT(*) as count FROM user";

    // Ejecuta la consulta SQL para obtener el número total de usuarios.
    db.query(countQuery, (err, countResult) => {
      if (err) {
        return res
          .status(500)
          .send({ error: "Error al obtener el número total de usuarios" });
      }

      // Extrae el número total de usuarios de la respuesta de la base de datos.
      const totalUsers = countResult[0].count;

      // Envía una respuesta con estado 200, incluyendo la lista de usuarios y el número total de usuarios.
      res.status(200).send({ data: results, total: totalUsers });
    });
  });
});

/**
 * Endpoint para actualizar el tipo de usuario.
 */
router.put("/update-type", (req, res) => {
  const { userId, newUserType } = req.body;

  const query = "UPDATE user SET user_type = ? WHERE id = ?";
  db.query(query, [newUserType, userId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .send({ error: "Error al actualizar el tipo de usuario" });
    }
    res
      .status(200)
      .send({ success: "Tipo de usuario actualizado exitosamente" });
  });
});

/**
 * Endpoint para eliminar a un usuario.
 */
router.delete("/delete-user/:id", (req, res) => {
  const userId = req.params.id;

  const query = "DELETE FROM user WHERE id = ?";
  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).send({ error: "Error al eliminar el usuario" });
    }
    res.status(200).send({ success: "Usuario eliminado exitosamente" });
  });
});

/**
 * Endpoint para eliminar a múltiples usuarios
 */
router.post("/delete-multiple", (req, res) => {
  const userIds = req.body.userIds;

  const query = "DELETE FROM user WHERE id IN (?)";
  db.query(query, [userIds], (err, result) => {
    if (err) {
      return res.status(500).send({ error: "Error al eliminar usuarios" });
    }
    res.status(200).send({ success: "Usuarios eliminados exitosamente" });
  });
});

module.exports = router;
