const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post("/buscar", async (req, res) => {
  try {
    const db = req.app.locals.db;
    if (!db) {
      return res.status(500).json({ error: "Sin conexión a la base de datos" });
    }

    const { comuna, colegio, curso, asignatura, rut } = req.body;

    //Validación obligatoria de los campos a ingresar
    if (!comuna && !colegio && !curso && !asignatura && !rut) {
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

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(rows);
  } catch (error) {
    console.error("❌ Error al buscar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = app;
