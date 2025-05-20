const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: process.env.DB_HOST, // db
  user: process.env.DB_USER, // root
  password: process.env.DB_PASSWORD, // 1234
  database: process.env.DB_NAME, // db_main
});

connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

// Registro de usuario
app.post("/register", (req, res) => {
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
    INSERT INTO usuario (rut, nombre, apellido1, apellido2, correo, contrasena, tipo_usuario)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
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
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = "SELECT * FROM usuario WHERE correo = ?";

  connection.query(sql, [correo], (err, results) => {
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

app.get("/", (req, res) => {
  res.send("Funciona");
});

app.get("/usuario", (req, res) => {
  const sql = "SELECT * FROM usuario";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }

    res.json(results);
  });
});

app.listen(3000, () => {
  console.log("Login service running on port 3000");
});
