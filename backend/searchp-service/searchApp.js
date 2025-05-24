const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let connection;

async function connectWithRetry() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "db",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Conexión establecida con la base de datos.");
    app.locals.db = connection;
  } catch (err) {
    console.error(
      "❌ Error al conectar con la BD. Reintentando en 5s...",
      err.message
    );
    setTimeout(connectWithRetry, 5000);
  }
}

// Conectar solo si no está en entorno de test
if (process.env.NODE_ENV !== "test") {
  connectWithRetry();
}

// Ruta para búsqueda avanzada
app.post("/buscar", async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: "Sin conexión a la base de datos" });
    }

    const { comuna, colegio, curso, asignatura, rut } = req.body;

    let query = `
      SELECT 
        U.ID_usuario,
        U.Rut,
        U.Nombres,
        U.Apellido_Paterno,
        U.Apellido_Materno,
        U.Correo,
        E.Nombre AS Establecimiento,
        E.Comuna,
        C.Nombre_curso,
        A.Nombre AS Asignatura
      FROM Usuario U
      LEFT JOIN Establecimiento E ON U.ID_establecimiento = E.ID_establecimiento
      LEFT JOIN Alumno AL ON U.ID_usuario = AL.ID_alumno
      LEFT JOIN Curso C ON C.ID_establecimiento = E.ID_establecimiento
      LEFT JOIN Curso_asignatura CA ON C.ID_curso = CA.ID_curso
      LEFT JOIN Asignatura A ON CA.ID_asignatura = A.ID_asignatura
      LEFT JOIN Asignatura_docente AD ON A.ID_asignatura = AD.ID_asignatura AND AD.ID_usuario = U.ID_usuario
      WHERE U.Rut IS NOT NULL
        AND E.Comuna IS NOT NULL
        AND E.Nombre IS NOT NULL
        AND C.Nombre_curso IS NOT NULL
        AND A.Nombre IS NOT NULL
    `;

    const params = [];

    if (comuna) {
      query += " AND E.Comuna = ?";
      params.push(comuna);
    }

    if (colegio) {
      query += " AND E.Nombre = ?";
      params.push(colegio);
    }

    if (curso) {
      query += " AND C.Nombre_curso = ?";
      params.push(curso);
    }

    if (asignatura) {
      query += " AND A.Nombre = ?";
      params.push(asignatura);
    }

    if (rut) {
      query += " AND U.Rut = ?";
      params.push(rut);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al buscar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = app;
