const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());

let connection;
app.set("db", connection);

//Configuración de la base de datos :v
function connectWithRetry() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "db_main",
  });

  connection.connect((err) => {
    if (err) {
      console.error("Error al conectar a la BD:", err.message);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("✅ Conectado a la base de datos.");
      app.set("db", connection);
    }
  });
}

connectWithRetry();

// 1. Crear colegio 
app.post("/colegio", (req, res) => {
  const {
    nombre,
    tipo_establecimiento,
    direccion,
    comuna,
    telefono,
    email_contacto,
    director_nombre,
  } = req.body;

  if (!nombre || !comuna) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const db = app.get("db");
  const sql = `INSERT INTO Establecimiento (Nombre, Tipo_establecimiento, Direccion, Comuna, Telefono, Email_contacto, Director_nombre)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [nombre, tipo_establecimiento, direccion, comuna, telefono, email_contacto, director_nombre], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al crear establecimiento" });
    res.status(201).json({ message: "Establecimiento creado", id: result.insertId });
  });
});

// 2. Crear curso
app.post("/curso", (req, res) => {
  const { nombre_curso, nivel, anio, jornada, id_establecimiento } = req.body;
  if (!nombre_curso || !id_establecimiento) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const db = app.get("db");
  db.query(
    "INSERT INTO Curso (Nombre_curso, Nivel, Anio, Jornada, ID_establecimiento) VALUES (?, ?, ?, ?, ?)",
    [nombre_curso, nivel, anio, jornada, id_establecimiento],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear curso" });
      res.status(201).json({ message: "Curso creado", id: result.insertId });
    }
  );
});

// 3. Crear asignatura
app.post("/asignatura", (req, res) => {
  const { nombre, nivel_educativo } = req.body;
  if (!nombre || !nivel_educativo) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const db = app.get("db");
  db.query(
    "INSERT INTO Asignatura (Nombre, Nivel_educativo) VALUES (?, ?)",
    [nombre, nivel_educativo],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear asignatura" });
      res.status(201).json({ message: "Asignatura creada", id: result.insertId });
    }
  );
});

// 4. Asociar asignatura a curso
app.post("/curso-asignatura", (req, res) => {
  const { id_curso, id_asignatura } = req.body;
  if (!id_curso || !id_asignatura) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const db = app.get("db");
  db.query(
    "INSERT INTO Curso_asignatura (ID_curso, ID_asignatura) VALUES (?, ?)",
    [id_curso, id_asignatura],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al asociar asignatura" });
      res.status(201).json({ message: "Asignatura asociada al curso" });
    }
  );
});

app.get("/", (req, res) => {
  res.send("Microservicio funcional");
});

module.exports = app;
