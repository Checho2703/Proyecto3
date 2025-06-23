const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const express = require("express");
const mysql = require("mysql2");
const client = require("prom-client"); // Prometheus client

//########################## Express de archivo ##############################
const extensionesValidas = ["pdf", "docx", "mp4"];

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

//########################## MÉTRICAS PROMETHEUS ##############################

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const totalUploadRequests = new client.Counter({
    name: "upload_total",
    help: "Total de peticiones al endpoint /uploadFile",
});

const tiempoRespuestaUpload = new client.Histogram({
    name: "tiempo_respuesta_upload_segundos",
    help: "Duración de peticiones al endpoint /uploadFile",
    buckets: [0.1, 0.5, 1, 2, 5],
});

register.registerMetric(totalUploadRequests);
register.registerMetric(tiempoRespuestaUpload);

//########################## BD connection ##############################

let connection;

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

// Conectar solo si no está en entorno de test
if (process.env.NODE_ENV !== "test") {
    connectWithRetry();
}

/*########################### FUNCTIONS #################################
Comportamiento entre las funciones:
    1. validarExtension: verifica que la extensión del archivo sea válida.
    2. crearRutaArchivo: crea una ruta de almacenamiento basada en los parámetros proporcionados (comuna, colegio, curso, asignatura).
    3. administradorCarpetas: verifica si la carpeta existe, si no, la crea.
    4. moverArchivo: mueve el archivo cargado a la ruta de almacenamiento creada.*/

//verifica que la extension del archivo sea valida
function validarExtension(extension) {
    return extensionesValidas.includes(extension);
}
// Crear ruta de almacenamiento
function crearRutaArchivo(comuna, colegio, curso, asignatura) {
    if (!comuna || !colegio || !curso || !asignatura) {
        throw new Error(
        "Todos los parámetros (comuna, colegio, curso, asignatura) son OBLIGATORIOS para crear la ruta del archivo."
        );
    }
    const rutaCarpeta = path.join(
        __dirname,
        "archivos",
        comuna,
        colegio,
        curso,
        asignatura
    );
    return rutaCarpeta;
}

// Creación de carpetas
function administradorCarpetas(rutaCarpeta) {
    if (!fs.existsSync(rutaCarpeta)) {
        console.log("carpeta creada");
        fs.mkdirSync(rutaCarpeta, { recursive: true });
    }
}

// Mover archivo a la carpeta objetivo
function moverArchivo(archivo, rutaDestino, callback) {
    archivo.mv(rutaDestino, callback);
}

// Guardar datos del archivo en la base de datos
function guardarDatosPDF(connection, datosArchivos, callback) {
    const sql = `
        INSERT INTO Archivo
        (Nombre, Tipo, Url, Formato, Fecha_subida, Descripcion)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valores = [
        datosArchivos.nombreArchivo,
        datosArchivos.tipo,
        datosArchivos.rutaDestino,
        datosArchivos.extensionArchivo,
        datosArchivos.fechaSubida,
        datosArchivos.descripcion,
    ];
    connection.query(sql, valores, (err, resultado) => {
        if (err) {
        console.log("❌ Error al guardar datos", err.message);
        return callback(err, null);
        }
        console.log("✅ Datos guardados:", resultado.insertId);
        callback(null, resultado.insertId);
    });
}



//########################### HTTP #################################

app.post("/uploadFile", async (req, res) => {
    const end = tiempoRespuestaUpload.startTimer();
    totalUploadRequests.inc();

    try {
        // BD
        const db = app.get("db");
        // Verificar si se ha enviado un archivo
        if (!req.files) {
        end();
        return res.status(400).json({
            ok: false,
            mensaje: "No se ha seleccionado ningún archivo",
            error: { mensaje: "Debe seleccionar un archivo PDF" },
        });
        }
        // Variables
        const archivo = req.files.archivo;
        const { comuna, colegio, curso, asignatura, tipo, descripcion } = req.body;
        const nombreArchivo = archivo.name;
        const extensionArchivo = path.extname(nombreArchivo).toLowerCase().slice(1);
        const fechaSubida = new Date();
        // Validar la extensión del archivo
        if (!validarExtension(extensionArchivo)) {
        end();
        return res.status(400).json({
            ok: false,
            mensaje: "Extensión de archivo no válida",
            error: { mensaje: "Debe subir un archivo PDF" },
        });
        }
        // Crear la ruta de almacenamiento y destino
        const rutaCarpeta = crearRutaArchivo(comuna, colegio, curso, asignatura);
        const rutaDestino = path.join(rutaCarpeta, nombreArchivo);
        // Preparar datos para la base de datos
        const datos = {
        nombreArchivo,
        tipo,
        rutaDestino,
        extensionArchivo,
        fechaSubida,
        descripcion,
        };
        // Verificar y crear las carpetas necesarias
        administradorCarpetas(rutaCarpeta);
        // Mover el archivo pdf
        moverArchivo(archivo, rutaDestino, (err) => {
        if (err) {
            end();
            return res.status(500).json({
            ok: false,
            mensaje: "Ha ocurrido un error al procesar el archivo",
            error: err,
            });
        }
        guardarDatosPDF(db, datos, (err, insertId) => {
            end();
            if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al guardar datos en BD",
                error: err,
            });
            }
            return res.status(200).json({
            ok: true,
            mensaje: "Archivo subido correctamente",
            ruta: rutaDestino,
            id: insertId,
            });
        });
        });
    } catch (err) {
        end();
        console.error("Error al subir el archivo:", err);
        return res.status(500).json({
        ok: false,
        mensaje: "Error al subir el archivo",
        error: err,
        });
    }
});

//########################### METRICAS #################################

app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

module.exports = app;


