const app = require("./searchApp");
const mysql = require("mysql2/promise");
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

connectWithRetry();




app.listen(3001, () => {
  console.log("Search corre en el puerto 3001");
});
