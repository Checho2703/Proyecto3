const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());

let connection;
app.set("db", connection);

// Conexión a la BD
function connectWithRetry() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "db_main",
  });

  connection.connect((err) => {
    if (err) {
      console.error("❌ Error al conectar a la BD:", err.message);
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

// 2. Crear curso (usando nombre del colegio)
app.post("/curso", (req, res) => {
  const { nombre_curso, nivel, anio, jornada, colegio } = req.body;

  if (!nombre_curso || !colegio) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const db = app.get("db");

  db.query("SELECT ID_establecimiento FROM Establecimiento WHERE Nombre = ?", [colegio], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al buscar colegio" });
    if (rows.length === 0) return res.status(404).json({ error: "Colegio no encontrado" });

    const id_establecimiento = rows[0].ID_establecimiento;

    db.query(
      "INSERT INTO Curso (Nombre_curso, Nivel, Anio, Jornada, ID_establecimiento) VALUES (?, ?, ?, ?, ?)",
      [nombre_curso, nivel, anio, jornada, id_establecimiento],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: "Error al crear curso" });
        res.status(201).json({ message: "Curso creado", id: result.insertId });
      }
    );
  });
});

// 3. Crear asignatura (recibe nombre colegio y curso, asocia automáticamente)
app.post("/asignatura", (req, res) => {
  const { nombre, nivel_educativo, colegio, curso } = req.body;

  if (!nombre || !nivel_educativo || !colegio || !curso) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const db = app.get("db");

  // Buscar ID del curso
  const query = `
    SELECT C.ID_curso 
    FROM Curso C 
    JOIN Establecimiento E ON C.ID_establecimiento = E.ID_establecimiento 
    WHERE C.Nombre_curso = ? AND E.Nombre = ?`;

  db.query(query, [curso, colegio], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al buscar curso" });
    if (rows.length === 0) return res.status(404).json({ error: "Curso o colegio no encontrado" });

    const id_curso = rows[0].ID_curso;

    // Insertar asignatura
    db.query(
      "INSERT INTO Asignatura (Nombre, Nivel_educativo) VALUES (?, ?)",
      [nombre, nivel_educativo],
      (err2, result2) => {
        if (err2) return res.status(500).json({ error: "Error al crear asignatura" });

        const id_asignatura = result2.insertId;

        // Asociar con el curso
        db.query(
          "INSERT INTO Curso_asignatura (ID_curso, ID_asignatura) VALUES (?, ?)",
          [id_curso, id_asignatura],
          (err3) => {
            if (err3) return res.status(500).json({ error: "Asignatura creada pero no asociada" });
            res.status(201).json({
              message: "Asignatura creada y asociada al curso",
              id: id_asignatura,
            });
          }
        );
      }
    );
  });
});



// Ruta test
app.get("/", (req, res) => {
  res.send("Microservicio funcional");
});

module.exports = app;

