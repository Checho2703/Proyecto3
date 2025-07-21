const express = require("express");
const mysql = require("mysql2/promise");
const client = require("prom-client");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let connection;

// Registro de metricas
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const totalBuscarRequests = new client.Counter({
  name: "buscar_total",
  help: "Total de peticiones al endpoint /buscar",
});

const tiempoRespuestaBuscar = new client.Histogram({
  name: "tiempo_respuesta_buscar_segundos",
  help: "Duración de peticiones al endpoint /buscar",
  buckets: [0.1, 0.5, 1, 2, 5],
});

register.registerMetric(totalBuscarRequests);
register.registerMetric(tiempoRespuestaBuscar);

// BD Conexion
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

if (process.env.NODE_ENV !== "test") {
  connectWithRetry();
}

//buscar usuarios
app.post("/buscar", async (req, res) => {
  const end = tiempoRespuestaBuscar.startTimer();
  totalBuscarRequests.inc();

  try {
    const db = req.app.locals.db;
    if (!db) {
      end();
      return res.status(500).json({ error: "Sin conexión a la base de datos" });
    }

    const { comuna, colegio, curso, asignatura, rut } = req.body;

    if (!comuna && !colegio && !curso && !asignatura && !rut) {
      end();
      return res
        .status(400)
        .json({ error: "Debe proporcionar al menos un criterio de búsqueda." });
    }

    let query = `
      SELECT 
        U.ID_usuario,
        U.Rut,
        U.Nombres,
        U.Apellido_Paterno,
        U.Apellido_Materno,
        U.Correo,
        U.Telefono,
        U.Estado,
        U.Fecha_nac,
        U.Tipo_usuario,
        R.Nombre_rol,
        E.Nombre AS Establecimiento,
        E.Comuna,
        C.Nombre_curso,
        A.Nombre AS Asignatura
      FROM Usuario U
      LEFT JOIN Rol_usuario R ON U.ID_rol = R.ID_rol
      LEFT JOIN Establecimiento E ON U.ID_establecimiento = E.ID_establecimiento
      LEFT JOIN Alumno AL ON U.ID_usuario = AL.ID_alumno
      LEFT JOIN Curso C ON C.ID_establecimiento = E.ID_establecimiento
      LEFT JOIN Curso_asignatura CA ON C.ID_curso = CA.ID_curso
      LEFT JOIN Asignatura A ON CA.ID_asignatura = A.ID_asignatura
      LEFT JOIN Asignatura_docente AD ON A.ID_asignatura = AD.ID_asignatura AND AD.ID_usuario = U.ID_usuario
      WHERE 1 = 1
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
    end();

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(rows);
  } catch (error) {
    end();
    console.error("❌ Error al buscar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// metricas para Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
