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
  Tipo_usuario VARCHAR(50),
  ID_rol INT,
  ID_establecimiento INT,
  FOREIGN KEY (ID_rol) REFERENCES Rol_usuario(ID_rol),
  FOREIGN KEY (ID_establecimiento) REFERENCES Establecimiento(ID_establecimiento)
);

-- 4. Apoderado
CREATE TABLE IF NOT EXISTS Apoderado (
  ID_apoderado INT PRIMARY KEY,
  Parentezco VARCHAR(50),
  ID_alumno INT,
  FOREIGN KEY (ID_apoderado) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_alumno) REFERENCES Usuario(ID_usuario)
);

-- 5. Alumno
CREATE TABLE IF NOT EXISTS Alumno (
  ID_alumno INT PRIMARY KEY,
  Curso_actual VARCHAR(50),
  Nacionalidad VARCHAR(50),
  Fecha_ingreso DATE,
  Retirado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ID_alumno) REFERENCES Usuario(ID_usuario)
);

-- 6. Funcionario
CREATE TABLE IF NOT EXISTS Funcionario (
  ID_funcionario INT PRIMARY KEY,
  Cargo VARCHAR(50),
  Departamento VARCHAR(100),
  Fecha_ingreso DATE,
  FOREIGN KEY (ID_funcionario) REFERENCES Usuario(ID_usuario)
);

-- 7. Asignaturas
CREATE TABLE IF NOT EXISTS Asignatura (
  ID_asignatura INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100),
  Nivel_educativo VARCHAR(50)
);

-- Tabla intermedia Asignatura-Docente
CREATE TABLE IF NOT EXISTS Asignatura_docente (
  ID_asignatura INT,
  ID_usuario INT,
  PRIMARY KEY (ID_asignatura, ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura),
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 8. Curso
CREATE TABLE IF NOT EXISTS Curso (
  ID_curso INT PRIMARY KEY AUTO_INCREMENT,
  Nombre_curso VARCHAR(100),
  Nivel VARCHAR(50),
  Anio YEAR,
  Jornada VARCHAR(20),
  ID_establecimiento INT,
  FOREIGN KEY (ID_establecimiento) REFERENCES Establecimiento(ID_establecimiento)
);

-- Tabla intermedia Curso-Asignatura
CREATE TABLE IF NOT EXISTS Curso_asignatura (
  ID_curso INT,
  ID_asignatura INT,
  PRIMARY KEY (ID_curso, ID_asignatura),
  FOREIGN KEY (ID_curso) REFERENCES Curso(ID_curso),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 9. Archivo
CREATE TABLE IF NOT EXISTS Archivo (
  ID_archivo INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100),
  Tipo VARCHAR(50),
  Formato VARCHAR(20),
  Url TEXT,
  Fecha_subida DATETIME,
  Descripcion TEXT,
  ID_profesor INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_profesor) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 10. Ensayo
CREATE TABLE IF NOT EXISTS Ensayo (
  ID_ensayo INT PRIMARY KEY AUTO_INCREMENT,
  Tipo VARCHAR(50),
  Fecha DATE,
  Resultado DECIMAL(5,2),
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 11. Reporte
CREATE TABLE Reporte (
  ID_reporte INT PRIMARY KEY AUTO_INCREMENT,
  Tipo VARCHAR(50),
  Contenido TEXT,
  Fecha DATETIME,
  Generado_por INT,           -- quién lo genera
  Para_usuario INT,           -- reporte individual (opcional)
  Para_establecimiento INT,   -- o reporte por colegio
  Para_comuna VARCHAR(50),    -- o por comuna (si es necesario)
  FOREIGN KEY (Generado_por) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (Para_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (Para_establecimiento) REFERENCES Establecimiento(ID_establecimiento)
);

-- 12. Asistencia
CREATE TABLE IF NOT EXISTS Asistencia (
  ID_asistencia INT PRIMARY KEY AUTO_INCREMENT,
  Fecha DATE,
  Presente BOOLEAN,
  Justificada BOOLEAN,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 13. Inasistencia
CREATE TABLE IF NOT EXISTS Inasistencia (
  ID_inasistencia INT PRIMARY KEY AUTO_INCREMENT,
  Fecha DATE,
  Justificada BOOLEAN,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 14. Historial de matrícula
CREATE TABLE IF NOT EXISTS Historial_matricula (
  ID_historial INT PRIMARY KEY AUTO_INCREMENT,
  ID_usuario INT,
  ID_establecimiento INT,
  Fecha_ingreso DATE,
  Fecha_retiro DATE,
  Motivo_retiro TEXT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_establecimiento) REFERENCES Establecimiento(ID_establecimiento)
);

-- 15. Accidente Escolar
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

-- 16. Notas
CREATE TABLE IF NOT EXISTS Notas (
  ID_nota INT PRIMARY KEY AUTO_INCREMENT,
  Nota DECIMAL(4,2),
  Fecha DATE,
  ID_usuario INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 17. Mensajes
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

-- 2. Establecimientos
INSERT INTO Establecimiento (Nombre, Tipo_establecimiento, Direccion, Comuna, Telefono, Email_contacto, Director_nombre) VALUES
('Colegio San Juan', 'Colegio', 'Av. Siempre Viva 123', 'Santiago', '221112233', 'contacto@sanjuan.cl', 'María González'),
('Liceo Bicentenario', 'Liceo', 'Calle Falsa 456', 'Ñuñoa', '224445566', 'info@liceobicentenario.cl', 'Pedro Ramírez'),
('Escuela Básica El Sol', 'Escuela', 'Pasaje Lunar 789', 'Providencia', '227778899', 'contacto@elsol.cl', 'Ana Torres'),
('Instituto Tecnológico', 'Instituto Profesional', 'Av. Principal 101', 'Las Condes', '229990011', 'admision@instituto.cl', 'Carlos Vera');

-- 3. Usuarios (Se insertan usuarios genéricos que luego serán Alumnos, Apoderados, Docentes, Funcionarios)
INSERT INTO Usuario (Rut, Nombres, Apellido_Paterno, Apellido_Materno, Correo, Contrasena, Telefono, Estado, Fecha_nac, ID_rol, ID_establecimiento) VALUES
('11111111-1', 'Juan', 'Pérez', 'García', 'juan.perez@example.com', 'hashed_pass1', '911111111', 'Activo', '2005-03-15', 3, 1), -- Alumno del Colegio San Juan (ID_usuario = 1)
('22222222-2', 'María', 'López', 'Silva', 'maria.lopez@example.com', 'hashed_pass2', '922222222', 'Activo', '1980-07-20', 2, 1), -- Docente del Colegio San Juan (ID_usuario = 2)
('33333333-3', 'Ana', 'Martínez', 'Fuentes', 'ana.martinez@example.com', 'hashed_pass3', '933333333', 'Activo', '1975-11-01', 4, NULL), -- Apoderado (ID_usuario = 3)
('44444444-4', 'Carlos', 'González', 'Rojas', 'carlos.gonzalez@example.com', 'hashed_pass4', '944444444', 'Activo', '1990-04-22', 5, 2), -- Funcionario del Liceo Bicentenario (ID_usuario = 4)
('55555555-5', 'Sofía', 'Ramírez', 'Díaz', 'sofia.ramirez@example.com', 'hashed_pass5', '955555555', 'Activo', '2006-09-01', 3, 2), -- Alumno del Liceo Bicentenario (ID_usuario = 5)
('66666666-6', 'Roberto', 'Soto', 'Vega', 'roberto.soto@example.com', 'hashed_pass6', '966666666', 'Activo', '1978-02-10', 2, 2); -- Docente del Liceo Bicentenario (ID_usuario = 6)