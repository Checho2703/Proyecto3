const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

// Configuración de conexión MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "main_db",
});

// Registro de usuario
app.post("/api/register", (req, res) => {
  const {
    rut,
    nombre,
    apellido1,
    apellido2,
    correo,
    contrasena,
    tipo_usuario,
  } = req.body;

  const sql = `
    INSERT INTO users (rut, nombre, apellido1, apellido2, correo, contrasena, tipo_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [rut, nombre, apellido1, apellido2, correo, contrasena, tipo_usuario],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al registrar usuario" });
      }

      res.status(201).json({ message: "Usuario registrado correctamente" });
    }
  );
});

// Inicio de sesión
app.post("/api/login", (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = "SELECT * FROM users WHERE correo = ?";

  db.query(sql, [correo], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error interno del servidor" });

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];

    if (user.contrasena !== contrasena) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id: user.id,
        rut: user.rut,
        nombre: user.nombre,
        tipo_usuario: user.tipo_usuario,
      },
    });
  });
});

app.listen(3000, () => {
  console.log("Login service running on port 3000");
});
