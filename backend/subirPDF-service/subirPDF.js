const express = require("express");
const fileUpload = require("express-fileupload");
const extensionesValidas = ['pdf'];
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());


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

app.put('/subirPDF', async (req, res) => {
    try {
        const db = req.app.get("db");

        if (!req.files || !req.files.archivo) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha seleccionado ningún archivo',
                error: { mensaje: 'Debe seleccionar un archivo PDF' }
            });
        }

        const archivo = req.files.archivo;
        const extensionArchivo = path.extname(archivo.name).toLowerCase().slice(1);

        if (!extensionesValidas.includes(extensionArchivo)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Extensión no válida',
                error: { mensaje: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
            });
        }

        const { comuna, colegio, curso, asignatura, } = req.body;

        if (!comuna || !colegio || !curso || !asignatura) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Faltan datos requeridos',
                error: { mensaje: 'Debe enviar comuna, colegio, curso, asignatura' }
            });
        }

        const rutaCarpeta = path.join(__dirname, 'archivos', comuna, colegio, curso, asignatura);
        const rutaArchivo = path.join(rutaCarpeta, archivo.name);

        // Crear carpeta si no existe
        if (!fs.existsSync(rutaCarpeta)) {
            fs.mkdirSync(rutaCarpeta, { recursive: true });
        }

        // Mover archivo
        archivo.mv(rutaArchivo, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover el archivo',
                    error: err
                });
            }

            const nombreArchivo = archivo.name;
            const fecha = new Date();
            const url = rutaArchivo; // URL del archivo en el servidor              

            const query = `INSERT INTO Archivo (Nombre, Url, Fecha_subida) VALUES (?, ?, ?)`;


            db.query(query, [nombreArchivo, url, fecha], (error, results) => {
                if (error) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar en la base de datos',
                        error: error
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Archivo subido y guardado correctamente',
                    archivo: {
                        nombre: nombreArchivo,
                        fecha_subida: fecha,
                        url: rutaArchivo
                    }
                });
            });
        });

    } catch (error) {
        console.error("❌ Error al subir el PDF:", error);
        return res.status(500).json({ ok: false, error: "Error interno del servidor" });
    }
});

module.exports = app;

