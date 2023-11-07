const express = require("express");
const router = express.Router();
const db = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "secret_key";

/**
 *
 ** INSERTS
 *
 */

// Número de rondas para el algoritmo de salting. Es una práctica estándar usar 10 rondas.
const saltRounds = 10;

// Función para capitalizar nombre y apellidos
function capitalize(str) {
  // Si la cadena está vacía, devuelve una cadena vacía
  if (!str || str.length === 0) return "";

  // Divide la cadena en palabras, capitaliza cada palabra y luego las une nuevamente.
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Endpoint para registrar un nuevo usuario.
router.post("/register", (req, res) => {
  // Desestructura el cuerpo del request para obtener la información del usuario.
  const { email, username, password, birth_date } = req.body;
  let { first_name, last_name } = req.body;

  // Capitaliza el nombre y los apellidos.
  first_name = capitalize(first_name);
  last_name = capitalize(last_name);

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
 *
 ** LOGIN
 *
 */

// Endpoint para el inicio de sesión del usuario.
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
        {
          id: user.id,
          username: user.username,
          user_type: user.user_type,
          user_id: user.id,
        },
        SECRET_KEY,
        {
          expiresIn: "1h", // Token expira en 1 hora
        }
      );

      // Decodificar el token para obtener la fecha de expiración
      const decodedToken = jwt.decode(token);
      const expiresAt = decodedToken.exp * 1000; // Convierte a milisegundos

      res.status(200).send({
        success: "Inicio de sesión exitoso",
        token: token,
        expiresAt: expiresAt,
      });
    });
  });
});

/**
 *
 ** DELETES
 *
 */

// Endpoint para eliminar a un usuario.
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

// Endpoint para eliminar a múltiples usuarios.
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

/**
 *
 ** UPDATES
 *
 */
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

// Función para capitalizar nombre y apellidos antes del update
function capitalize(str) {
  if (!str || str.length === 0) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Endpoint para actualizar el perfil
router.put("/update-profile", async (req, res) => {
  const user = req.body;

  // Capitaliza el nombre y los apellidos si están presentes.
  if (user.first_name) {
    user.first_name = capitalize(user.first_name);
  }

  if (user.last_name) {
    user.last_name = capitalize(user.last_name);
  }

  // No encriptamos la contraseña si no ha sido cambiada.
  if (user.password && user.password !== "") {
    try {
      // Salt y hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      user.password = hashedPassword;
    } catch (err) {
      console.error("Error encriptando la contraseña:", err);
      return res.status(500).send({
        error: "Error encriptando la contraseña",
        details: err.message,
      });
    }
  } else {
    // Si la contraseña está vacía, no la actualizamos.
    delete user.password;
  }

  let query;
  let queryParams;

  if (user.password) {
    query =
      "UPDATE user SET first_name = ?, last_name = ?, password = ?, birth_date = ? WHERE id = ?";
    queryParams = [
      user.first_name,
      user.last_name,
      user.password,
      user.birth_date,
      user.id,
    ];
  } else {
    query =
      "UPDATE user SET first_name = ?, last_name = ?, birth_date = ? WHERE id = ?";
    queryParams = [user.first_name, user.last_name, user.birth_date, user.id];
  }

  db.query(query, queryParams, (err) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).send({
        error: "Error actualizando el perfil",
        details: err.message,
      });
    }
    res.status(200).send({ success: "Perfil actualizado correctamente" });
  });
});

/**
 *
 ** GETS
 *
 */

// Endpoint para obtener todos los usuarios.
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

// Obtener tipo de usuario y decodificar token
router.get("/user-type", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send({ error: "Token no proporcionado" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send({ error: "Error al decodificar el token" });
    }

    return res.status(200).send({ user_type: decoded.user_type });
  });
});

// Endpoint para obtener datos de un usuario
router.get("/profile", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send({ error: "Token no proporcionado" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).send({ error: "Error al decodificar el token" });
    }

    const userId = decoded.id;
    const query = "SELECT * FROM user WHERE id = ?";
    db.query(query, [userId], (err, results) => {
      if (err) {
        return res
          .status(500)
          .send({ error: "Error al obtener datos del usuario" });
      }
      if (results.length === 0) {
        return res.status(404).send({ error: "Usuario no encontrado" });
      }

      const user = results[0];
      delete user.password; // Para no retornar la contraseña al frontend
      return res.status(200).send(user);
    });
  });
});

/**
 *
 ** CHECKS
 *
 */

// Endpoint para verificar si un nombre de usuario ya está en uso.
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

/**
 *
 ** COMENTARIOS
 *
 */

const verifyToken = (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    return res.status(401).send({ error: "Token no proporcionado" });
  }

  // Asumiendo que el token sigue el formato "Bearer <token>"
  const token = tokenHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .send({ error: "Token no proporcionado en formato correcto" });
  }

  // Verificar el token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Error al verificar token:", err);
      // Puedes ser más específico con el código de error,
      // por ejemplo: si es un error de expiración usar `err.name === 'TokenExpiredError'`
      return res.status(500).send({ error: "Error al decodificar el token" });
    }

    // Aquí podrías incluso revisar si el token ha expirado manualmente si lo necesitas.
    // Pero si jwt.verify no arroja un error, usualmente significa que el token es válido.
    req.userId = decoded.id;
    next();
  });
};

router.post("/episodes/:episodeId/comments", verifyToken, (req, res) => {
  const { comment: content } = req.body;
  const { episodeId } = req.params;
  const userId = req.userId;

  const query =
    "INSERT INTO comment (user_id, episode_id, content) VALUES (?, ?, ?)";
  db.query(query, [userId, episodeId, content], (err, results) => {
    if (err) {
      console.error("Database error:", err); // Log any database error
      return res.status(500).send({ error: "Error al añadir comentario" });
    }
    const newCommentId = results.insertId;
    res.status(201).send({
      success: "Comentario añadido con éxito",
      comment_id: newCommentId,
    });
  });
});

router.get("/episodes/:episodeId/comments", (req, res) => {
  const { episodeId } = req.params;

  const query = `
  SELECT c.comment_id, c.user_id, c.episode_id, c.content, c.comment_date, u.username 
  FROM comment c
  JOIN user u ON c.user_id = u.id
  WHERE c.episode_id = ?`;

  db.query(query, [episodeId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .send({ error: "Error al obtener los comentarios" });
    }

    const comments = results.map((comment) => ({
      id: comment.comment_id,
      userId: comment.user_id,
      episodeId: comment.episode_id,
      content: comment.content,
      createdAt: comment.comment_date,
      username: comment.username, // Aquí añadimos el username
    }));

    res.status(200).send({ comments: comments });
  });
});

router.delete("/comments/:commentId", verifyToken, (req, res) => {
  const { commentId } = req.params;
  const userId = req.userId;

  // Primero, verifica que el comentario pertenece al usuario
  const findCommentQuery = "SELECT user_id FROM comment WHERE comment_id = ?";
  db.query(findCommentQuery, [commentId], (findErr, findResults) => {
    if (findErr) {
      console.error("Database error al buscar comentario:", findErr);
      return res.status(500).send({ error: "Error al buscar comentario" });
    }

    if (findResults.length === 0) {
      return res.status(404).send({ error: "Comentario no encontrado" });
    }

    // Verifica que el comentario pertenece al usuario que hace la solicitud
    if (findResults[0].user_id !== userId) {
      return res
        .status(403)
        .send({ error: "No autorizado para borrar este comentario" });
    }

    // Si el comentario pertenece al usuario, procede a eliminar
    const deleteCommentQuery = "DELETE FROM comment WHERE comment_id = ?";
    db.query(deleteCommentQuery, [commentId], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database error al eliminar comentario:", deleteErr);
        return res.status(500).send({ error: "Error al eliminar comentario" });
      }

      if (deleteResults.affectedRows === 0) {
        // Ninguna fila afectada, lo que significa que el comentario no fue encontrado
        return res.status(404).send({ error: "Comentario no encontrado" });
      }

      // Comentario eliminado con éxito
      res.status(200).send({ success: "Comentario eliminado con éxito" });
    });
  });
});

/**
 *
 ** VALORACIONES
 *
 */

// Añadir una valoración a un episodio
router.post("/episodes/:episodeId/ratings", verifyToken, (req, res) => {
  const { rating: ratingValue } = req.body; // Asegúrate de que 'rating' es el campo correcto enviado desde el frontend
  const { episodeId } = req.params;
  const userId = req.userId; // Obtenido de la verificación del token

  // Antes de insertar, debemos verificar si el usuario ya ha valorado este episodio
  const findRatingQuery =
    "SELECT * FROM rating WHERE user_id = ? AND episode_id = ?";
  db.query(findRatingQuery, [userId, episodeId], (findErr, findResults) => {
    if (findErr) {
      console.error("Database error al buscar valoración:", findErr);
      return res.status(500).send({ error: "Error al buscar valoración" });
    }

    if (findResults.length > 0) {
      // El usuario ya ha valorado este episodio, tal vez quieras actualizar la valoración en su lugar
      const updateRatingQuery =
        "UPDATE rating SET rating_value = ? WHERE user_id = ? AND episode_id = ?";
      db.query(
        updateRatingQuery,
        [ratingValue, userId, episodeId],
        (updateErr, updateResults) => {
          if (updateErr) {
            console.error(
              "Database error al actualizar valoración:",
              updateErr
            );
            return res
              .status(500)
              .send({ error: "Error al actualizar valoración" });
          }
          res.status(200).send({
            success: "Valoración actualizada con éxito",
            affectedRows: updateResults.affectedRows, // Número de filas afectadas por la actualización
          });
        }
      );
    } else {
      // Inserta la nueva valoración ya que no existe previamente
      const insertRatingQuery =
        "INSERT INTO rating (user_id, episode_id, rating_value) VALUES (?, ?, ?)";
      db.query(
        insertRatingQuery,
        [userId, episodeId, ratingValue],
        (insertErr, insertResults) => {
          if (insertErr) {
            console.error("Database error al añadir valoración:", insertErr);
            return res
              .status(500)
              .send({ error: "Error al añadir valoración" });
          }
          res.status(201).send({
            success: "Valoración añadida con éxito",
            rating_id: insertResults.insertId,
          });
        }
      );
    }
  });
});

module.exports = router;
