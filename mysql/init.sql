
CREATE DATABASE IF NOT EXISTS db_main;
USE db_main;

CREATE TABLE IF NOT EXISTS usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rut VARCHAR(20),
  nombre VARCHAR(50),
  apellido1 VARCHAR(50),
  apellido2 VARCHAR(50),
  correo VARCHAR(100) UNIQUE,
  contrasena VARCHAR(100),
  tipo_usuario VARCHAR(50)
);

-- Inserta un usuario de prueba
INSERT INTO usuario (rut, nombre, apellido1, apellido2, correo, contrasena, tipo_usuario)
VALUES ('12345678-9', 'Juan', 'Pérez', 'González', 'juan@example.com', '1234', 'admin');
