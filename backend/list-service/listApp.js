// Versión JSON del código original: todos los endpoints usan POST con JSON en el body
const express = require("express");
const mysql = require("mysql2/promise");
const client = require("prom-client");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(3003, () => {
  console.log("List corre en el puerto 3003");
});

let connection;

// Registro de métricas
const register = new client.Registry();
client.collectDefaultMetrics({ register });

function crearMetricas(nombre) {
  return {
    totalRequests: new client.Counter({
      name: `${nombre}_total`,
      help: `Total de peticiones al endpoint /${nombre}`,
    }),
    tiempoRespuesta: new client.Histogram({
      name: `tiempo_respuesta_${nombre}_segundos`,
      help: `Duración de peticiones al endpoint /${nombre}`,
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
  };
}

const metricsColegios = crearMetricas("colegios");
const metricsCursos = crearMetricas("cursos");
const metricsAsignaturas = crearMetricas("asignaturas");
const metricsArchivos = crearMetricas("archivos");

register.registerMetric(metricsColegios.totalRequests);
register.registerMetric(metricsColegios.tiempoRespuesta);
register.registerMetric(metricsCursos.totalRequests);
register.registerMetric(metricsCursos.tiempoRespuesta);
register.registerMetric(metricsAsignaturas.totalRequests);
register.registerMetric(metricsAsignaturas.tiempoRespuesta);
register.registerMetric(metricsArchivos.totalRequests);
register.registerMetric(metricsArchivos.tiempoRespuesta);

async function connectWithRetry() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "db",
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "db_main",
    });
    console.log("\u2705 Conexión establecida con la base de datos.");
    app.locals.db = connection;
  } catch (err) {
    console.error("\u274c Error al conectar con la BD. Reintentando en 5s...", err.message);
    setTimeout(connectWithRetry, 5000);
  }
}

if (process.env.NODE_ENV !== "test") {
  connectWithRetry();
}

// 1. Listar colegios por comuna
app.post("/colegios", async (req, res) => {
  const end = metricsColegios.tiempoRespuesta.startTimer();
  metricsColegios.totalRequests.inc();

  try {
    const { comuna } = req.body;
    if (!comuna) {
      end();
      return res.status(400).json({ error: "Debe proporcionar una comuna." });
    }

    const db = req.app.locals.db;
    const [rows] = await db.query(
      "SELECT ID_establecimiento, Nombre FROM Establecimiento WHERE Comuna = ?",
      [comuna]
    );

    end();
    res.json(rows);
  } catch (error) {
    end();
    console.error("\u274c Error al buscar colegios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 2. Listar cursos por colegio
app.post("/cursos", async (req, res) => {
  const end = metricsCursos.tiempoRespuesta.startTimer();
  metricsCursos.totalRequests.inc();

  try {
    const { colegio } = req.body;
    if (!colegio) {
      end();
      return res.status(400).json({ error: "Debe proporcionar el nombre del colegio." });
    }

    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT C.ID_curso, C.Nombre_curso 
       FROM Curso C
       JOIN Establecimiento E ON C.ID_establecimiento = E.ID_establecimiento
       WHERE E.Nombre = ?`,
      [colegio]
    );

    end();
    res.json(rows);
  } catch (error) {
    end();
    console.error("\u274c Error al buscar cursos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 3. Listar asignaturas por colegio y curso
app.post("/asignaturas", async (req, res) => {
  const end = metricsAsignaturas.tiempoRespuesta.startTimer();
  metricsAsignaturas.totalRequests.inc();

  try {
    const { colegio, curso } = req.body;

    if (!colegio || !curso) {
      end();
      return res.status(400).json({
        error: "Debe proporcionar el nombre del colegio y del curso.",
      });
    }

    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT A.ID_asignatura, A.Nombre 
       FROM Asignatura A
       JOIN Curso_asignatura CA ON A.ID_asignatura = CA.ID_asignatura
       JOIN Curso C ON CA.ID_curso = C.ID_curso
       JOIN Establecimiento E ON C.ID_establecimiento = E.ID_establecimiento
       WHERE C.Nombre_curso = ? AND E.Nombre = ?`,
      [curso, colegio]
    );

    end();
    res.json(rows);
  } catch (error) {
    end();
    console.error("\u274c Error al buscar asignaturas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 4. Listar archivos por colegio, curso y asignatura
app.post("/archivos", async (req, res) => {
  const end = metricsArchivos.tiempoRespuesta.startTimer();
  metricsArchivos.totalRequests.inc();

  try {
    const { colegio, curso, asignatura } = req.body;

    if (!colegio || !curso || !asignatura) {
      end();
      return res.status(400).json({
        error: "Debe proporcionar colegio, curso y asignatura.",
      });
    }

    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT Ar.ID_archivo, Ar.Nombre, Ar.Tipo, Ar.Formato, Ar.Url, Ar.Fecha_subida, Ar.Descripcion,
              A.Nombre AS Asignatura, U.Nombres AS Profesor, C.Nombre_curso, E.Nombre AS Colegio
       FROM Archivo Ar
       JOIN Asignatura A ON Ar.ID_asignatura = A.ID_asignatura
       JOIN Usuario U ON Ar.ID_profesor = U.ID_usuario
       JOIN Asignatura_docente AD ON AD.ID_asignatura = A.ID_asignatura AND AD.ID_usuario = U.ID_usuario
       JOIN Curso_asignatura CA ON CA.ID_asignatura = A.ID_asignatura
       JOIN Curso C ON CA.ID_curso = C.ID_curso
       JOIN Establecimiento E ON C.ID_establecimiento = E.ID_establecimiento
       WHERE A.Nombre = ? AND C.Nombre_curso = ? AND E.Nombre = ?`,
      [asignatura, curso, colegio]
    );

    end();
    res.json(rows);
  } catch (error) {
    end();
    console.error("\u274c Error al buscar archivos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 5. Prometheus metrics
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = app;
