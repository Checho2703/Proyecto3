const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let connection;

app.set("db", connection);

function connectWithRetry() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error(
        "❌ Error al conectar con la BD. Reintentando en 5s...",
        err.message
      );
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("✅ Conexión establecida con la base de datos.");
      app.set("db", connection);
    }
  });
}

if (process.env.NODE_ENV !== "test") {
  connectWithRetry();
}

// Registro de usuario
app.post("/register", (req, res) => {
  const {
    rut,
    nombres,
    apellido_paterno,
    apellido_materno,
    correo,
    contrasena,
    telefono,
    estado,
    fecha_nac,
    id_rol,
    id_establecimiento,
  } = req.body;

  if (!rut || !nombres || !apellido_paterno || !correo || !contrasena) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const usuario = {
    Rut: rut,
    Nombres: nombres,
    Apellido_Paterno: apellido_paterno,
    Apellido_Materno: apellido_materno || null,
    Correo: correo,
    Contrasena: contrasena,
    Telefono: telefono || null,
    Estado: estado || "Activo",
    Fecha_nac: fecha_nac || null,
    ID_rol: id_rol || null,
    ID_establecimiento: id_establecimiento || null,
  };

  const db = app.get("db");
  if (!db) {
    return res.status(500).json({ error: "Base de datos no disponible" });
  }

  const query = "INSERT INTO Usuario SET ?";
  db.query(query, usuario, (error, results) => {
    if (error) {
      console.error("Error en la base de datos:", error);
      return res.status(500).json({ error: "Error al registrar usuario" });
    }
    res.status(201).json({
      message: "Usuario registrado",
      id: results.insertId,
    });
  });
});

// Inicio de sesión
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = "SELECT * FROM Usuario WHERE Correo = ?";

  const db = app.get("db");
  if (!db) {
    return res.status(500).json({ error: "Base de datos no disponible" });
  }

  db.query(sql, [correo], (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error interno del servidor" });

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];

    if (user.Contrasena !== contrasena) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      message: "Inicio de sesión exitoso",
      usuario: {
        id: user.ID_usuario,
        rut: user.Rut,
        nombre: user.Nombres,
        id_rol: user.ID_rol,
        id_establecimiento: user.ID_establecimiento,
      },
    });
  });
});

app.get("/", (req, res) => {
  res.send("Funciona");
});


module.exports = app;
