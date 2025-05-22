CREATE DATABASE IF NOT EXISTS db_main;
USE db_main;

-- 1. Roles
CREATE TABLE IF NOT EXISTS Rol_usuario (
  ID_rol INT PRIMARY KEY AUTO_INCREMENT,
  Nombre_rol VARCHAR(50) NOT NULL
);

-- 2. Establecimientos
CREATE TABLE IF NOT EXISTS Establecimiento (
  ID_establecimiento INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Tipo_establecimiento VARCHAR(50),
  Direccion VARCHAR(150),
  Comuna VARCHAR(50),
  Telefono VARCHAR(20),
  Email_contacto VARCHAR(100),
  Director_nombre VARCHAR(100)
);

-- 3. Usuarios
CREATE TABLE IF NOT EXISTS Usuario (
  ID_usuario INT PRIMARY KEY AUTO_INCREMENT,
  Rut VARCHAR(20) UNIQUE,
  Nombres VARCHAR(100) NOT NULL,
  Apellido_Paterno VARCHAR(50),
  Apellido_Materno VARCHAR(50),
  Correo VARCHAR(100) UNIQUE NOT NULL,
  Contrasena VARCHAR(255) NOT NULL,
  Telefono VARCHAR(20),
  Estado VARCHAR(20),
  Fecha_nac DATE,
  ID_rol INT,
  ID_establecimiento INT,
  FOREIGN KEY (ID_rol) REFERENCES Rol_usuario(ID_rol),
  FOREIGN KEY (ID_establecimiento) REFERENCES Establecimiento(ID_establecimiento)
);

-- 4. Asignaturas
CREATE TABLE IF NOT EXISTS Asignatura (
  ID_asignatura INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100),
  Nivel_educativo VARCHAR(50),
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 5. Curso
CREATE TABLE IF NOT EXISTS Curso (
  ID_curso INT PRIMARY KEY AUTO_INCREMENT,
  Nombre_curso VARCHAR(100),
  Nivel VARCHAR(50),
  Anio YEAR,
  Jornada VARCHAR(20),
  ID_establecimiento INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_establecimiento) REFERENCES Establecimiento(ID_establecimiento),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 6. Archivo
CREATE TABLE IF NOT EXISTS Archivo (
  ID_archivo INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100),
  Tipo VARCHAR(50),
  Formato VARCHAR(20),
  Url TEXT,
  Fecha_subida DATETIME,
  DUA TEXT,
  OA TEXT,
  ID_usuario INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 7. Reporte
CREATE TABLE IF NOT EXISTS Reporte (
  ID_reporte INT PRIMARY KEY AUTO_INCREMENT,
  Tipo VARCHAR(50),
  Contenido TEXT,
  Fecha DATETIME,
  ID_usuario INT,
  ID_archivo INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_archivo) REFERENCES Archivo(ID_archivo)
);

-- 8. Asistencia
CREATE TABLE IF NOT EXISTS Asistencia (
  ID_asistencia INT PRIMARY KEY AUTO_INCREMENT,
  Fecha DATE,
  Presente BOOLEAN,
  Justificada BOOLEAN,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 9. Accidente Escolar
CREATE TABLE IF NOT EXISTS Accidente_escolar (
  ID_accidente INT PRIMARY KEY AUTO_INCREMENT,
  Fecha DATE,
  Descripcion TEXT,
  Tipo_lesion VARCHAR(100),
  Lugar VARCHAR(100),
  Fue_derivado BOOLEAN,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 10. Notas
CREATE TABLE IF NOT EXISTS Notas (
  ID_nota INT PRIMARY KEY AUTO_INCREMENT,
  Nota DECIMAL(4,2),
  Fecha DATE,
  ID_usuario INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 11. Mensajes
CREATE TABLE IF NOT EXISTS Mensaje (
  ID_mensaje INT PRIMARY KEY AUTO_INCREMENT,
  Destinatario_tipo VARCHAR(50),
  Contenido TEXT,
  Fecha_envio DATETIME,
  Asunto VARCHAR(100),
  Prioridad VARCHAR(20),
  ID_usuario INT,
  ID_rol INT,
  ID_establecimiento INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_rol) REFERENCES Rol_usuario(ID_rol),
  FOREIGN KEY (ID_establecimiento) REFERENCES Establecimiento(ID_establecimiento)
);

-- Inserciones de prueba
INSERT INTO Rol_usuario (Nombre_rol)
VALUES ('Profesor');

INSERT INTO Establecimiento (Nombre, Tipo_establecimiento, Direccion, Comuna, Telefono, Email_contacto, Director_nombre)
VALUES ('Colegio Ejemplo', 'Particular', 'Av. Ejemplo 123', 'Chillan', '22222222', 'ColegioEjemplo@example.com', 'Pedro Pérez');

INSERT INTO Usuario (Rut, Nombres, Apellido_Paterno, Apellido_Materno, Correo, Contrasena, Telefono, Estado, Fecha_nac, ID_rol, ID_establecimiento)
VALUES ('12345678-9', 'Juan Miguel', 'Pérez', 'Gonzálezov', 'juan@example.com', '1234', '11111111', 'Activo', '1990-01-01', 1, 1);
