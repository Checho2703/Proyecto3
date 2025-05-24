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

-- 4. Alumno (Ya no se referencia a Apoderado aquí)
CREATE TABLE IF NOT EXISTS Alumno (
  ID_alumno INT PRIMARY KEY,
  Curso_actual VARCHAR(50),
  Nacionalidad VARCHAR(50),
  Fecha_ingreso DATE,
  Retirado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (ID_alumno) REFERENCES Usuario(ID_usuario)
);

-- 5. Funcionario
CREATE TABLE IF NOT EXISTS Funcionario (
  ID_funcionario INT PRIMARY KEY,
  Cargo VARCHAR(50),
  Departamento VARCHAR(100),
  Fecha_ingreso DATE,
  FOREIGN KEY (ID_funcionario) REFERENCES Usuario(ID_usuario)
);

-- 6. Asignaturas
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

-- 7. Curso
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

-- 8. Archivo
CREATE TABLE IF NOT EXISTS Archivo (
  ID_archivo INT PRIMARY KEY AUTO_INCREMENT,
  Nombre VARCHAR(100),
  Tipo VARCHAR(50),
  Formato VARCHAR(20),
  Url TEXT,
  Fecha_subida DATETIME,
  DUA TEXT,
  OA TEXT,
  Nivel_educativo VARCHAR(50),
  Adecuacion_DUA TEXT,
  Objetivos_aprendizaje TEXT,
  ID_profesor INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_profesor) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 9. Ensayo
CREATE TABLE IF NOT EXISTS Ensayo (
  ID_ensayo INT PRIMARY KEY AUTO_INCREMENT,
  Tipo VARCHAR(50),
  Fecha DATE,
  Resultado DECIMAL(5,2),
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 10. Reporte
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

-- 11. Asistencia
CREATE TABLE IF NOT EXISTS Asistencia (
  ID_asistencia INT PRIMARY KEY AUTO_INCREMENT,
  Fecha DATE,
  Presente BOOLEAN,
  Justificada BOOLEAN,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 12. Inasistencia
CREATE TABLE IF NOT EXISTS Inasistencia (
  ID_inasistencia INT PRIMARY KEY AUTO_INCREMENT,
  Fecha DATE,
  Justificada BOOLEAN,
  ID_usuario INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario)
);

-- 13. Historial de matrícula
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

-- 14. Accidente Escolar
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

-- 15. Notas
CREATE TABLE IF NOT EXISTS Notas (
  ID_nota INT PRIMARY KEY AUTO_INCREMENT,
  Nota DECIMAL(4,2),
  Fecha DATE,
  ID_usuario INT,
  ID_asignatura INT,
  FOREIGN KEY (ID_usuario) REFERENCES Usuario(ID_usuario),
  FOREIGN KEY (ID_asignatura) REFERENCES Asignatura(ID_asignatura)
);

-- 16. Mensajes
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

-- ¡NUEVA TABLA! Relación muchos a muchos entre Apoderados y Alumnos
CREATE TABLE IF NOT EXISTS Apoderado_Alumno (
    ID_apoderado_fk INT, -- Esto es el ID_usuario del Apoderado
    ID_alumno_fk INT,   -- Esto es el ID_usuario del Alumno
    Parentezco VARCHAR(50), -- El parentezco del apoderado con este alumno específico
    PRIMARY KEY (ID_apoderado_fk, ID_alumno_fk), -- La combinación de ambos IDs es única
    FOREIGN KEY (ID_apoderado_fk) REFERENCES Usuario(ID_usuario),
    FOREIGN KEY (ID_alumno_fk) REFERENCES Usuario(ID_usuario)
);

-- 1. Roles
INSERT INTO Rol_usuario (Nombre_rol) VALUES
('Administrador'),
('Docente'),
('Alumno'),
('Apoderado'),
('Funcionario');

-- 2. Establecimientos
INSERT INTO Establecimiento (Nombre, Tipo_establecimiento, Direccion, Comuna, Telefono, Email_contacto, Director_nombre) VALUES
('Colegio San Juan', 'Colegio', 'Av. Siempre Viva 123', 'Santiago', '221112233', 'contacto@sanjuan.cl', 'María González'),
('Liceo Bicentenario', 'Liceo', 'Calle Falsa 456', 'Ñuñoa', '224445566', 'info@liceobicentenario.cl', 'Pedro Ramírez'),
('Escuela Básica El Sol', 'Escuela', 'Pasaje Lunar 789', 'Providencia', '227778899', 'contacto@elsol.cl', 'Ana Torres'),
('Instituto Tecnológico', 'Instituto Profesional', 'Av. Principal 101', 'Las Condes', '229990011', 'admision@instituto.cl', 'Carlos Vera');

-- 3. Usuarios (Se insertan usuarios genéricos que luego serán Alumnos, Apoderados, Docentes, Funcionarios)
INSERT INTO Usuario (Rut, Nombres, Apellido_Paterno, Apellido_Materno, Correo, Contrasena, Telefono, Estado, Fecha_nac, Tipo_usuario, ID_rol, ID_establecimiento) VALUES
('11111111-1', 'Juan', 'Pérez', 'García', 'juan.perez@example.com', 'hashed_pass1', '911111111', 'Activo', '2005-03-15', 'Alumno', 3, 1), -- Alumno del Colegio San Juan (ID_usuario = 1)
('22222222-2', 'María', 'López', 'Silva', 'maria.lopez@example.com', 'hashed_pass2', '922222222', 'Activo', '1980-07-20', 'Docente', 2, 1), -- Docente del Colegio San Juan (ID_usuario = 2)
('33333333-3', 'Ana', 'Martínez', 'Fuentes', 'ana.martinez@example.com', 'hashed_pass3', '933333333', 'Activo', '1975-11-01', 'Apoderado', 4, NULL), -- Apoderado (ID_usuario = 3)
('44444444-4', 'Carlos', 'González', 'Rojas', 'carlos.gonzalez@example.com', 'hashed_pass4', '944444444', 'Activo', '1990-04-22', 'Funcionario', 5, 2), -- Funcionario del Liceo Bicentenario (ID_usuario = 4)
('55555555-5', 'Sofía', 'Ramírez', 'Díaz', 'sofia.ramirez@example.com', 'hashed_pass5', '955555555', 'Activo', '2006-09-01', 'Alumno', 3, 2), -- Alumno del Liceo Bicentenario (ID_usuario = 5)
('66666666-6', 'Roberto', 'Soto', 'Vega', 'roberto.soto@example.com', 'hashed_pass6', '966666666', 'Activo', '1978-02-10', 'Docente', 2, 2); -- Docente del Liceo Bicentenario (ID_usuario = 6)


-- 4. Alumno (ID_alumno es ID_usuario)
INSERT INTO Alumno (ID_alumno, Curso_actual, Nacionalidad, Fecha_ingreso, Retirado) VALUES
(1, '8° Básico', 'Chilena', '2015-03-01', FALSE),
(5, '1° Medio', 'Venezolana', '2019-03-05', FALSE);

-- 5. Funcionario (ID_funcionario es ID_usuario)
INSERT INTO Funcionario (ID_funcionario, Cargo, Departamento, Fecha_ingreso) VALUES
(4, 'Secretario', 'Administración', '2018-01-10');

-- 6. Asignaturas
INSERT INTO Asignatura (Nombre, Nivel_educativo) VALUES
('Matemáticas', 'Básica'),
('Lenguaje y Comunicación', 'Media'),
('Historia, Geografía y Ciencias Sociales', 'Básica'),
('Ciencias Naturales', 'Media');

-- Tabla intermedia Asignatura-Docente
INSERT INTO Asignatura_docente (ID_asignatura, ID_usuario) VALUES
(1, 2), -- Matemáticas impartida por María López (docente)
(2, 2), -- Lenguaje impartida por María López (docente)
(3, 6), -- Historia impartida por Roberto Soto (docente)
(4, 6); -- Ciencias Naturales impartida por Roberto Soto (docente)

-- 7. Curso
INSERT INTO Curso (Nombre_curso, Nivel, Anio, Jornada, ID_establecimiento) VALUES
('8° Básico A', 'Básico', 2024, 'Mañana', 1),
('1° Medio B', 'Medio', 2024, 'Tarde', 2),
('7° Básico C', 'Básico', 2024, 'Mañana', 1),
('2° Medio A', 'Medio', 2024, 'Mañana', 2);

-- Tabla intermedia Curso-Asignatura
INSERT INTO Curso_asignatura (ID_curso, ID_asignatura) VALUES
(1, 1), -- 8° Básico A tiene Matemáticas
(1, 3), -- 8° Básico A tiene Historia
(2, 2), -- 1° Medio B tiene Lenguaje
(2, 4); -- 1° Medio B tiene Ciencias Naturales

-- 8. Archivo
INSERT INTO Archivo (Nombre, Tipo, Formato, Url, Fecha_subida, DUA, OA, Nivel_educativo, Adecuacion_DUA, Objetivos_aprendizaje, ID_profesor, ID_asignatura) VALUES
('Guía de Ecuaciones', 'Material de Apoyo', 'PDF', '[http://ejemplo.com/guia_mat.pdf](http://ejemplo.com/guia_mat.pdf)', '2024-03-10 10:00:00', 'Principios de DUA', 'Resolver ecuaciones lineales', 'Básica', 'Adecuación para dislexia', 'Comprensión y aplicación de ecuaciones', 2, 1),
('Presentación Clima', 'Presentación', 'PPTX', '[http://ejemplo.com/pres_cien.pptx](http://ejemplo.com/pres_cien.pptx)', '2024-04-01 14:30:00', 'Variedad de presentación', 'Describir fenómenos climáticos', 'Media', 'Uso de pictogramas', 'Identificación de factores climáticos', 6, 4),
('Ficha de Lectura', 'Actividad', 'DOCX', '[http://ejemplo.com/ficha_lectura.docx](http://ejemplo.com/ficha_lectura.docx)', '2024-03-20 11:00:00', 'Formato flexible', 'Analizar textos narrativos', 'Básica', 'Preguntas con opciones múltiples', 'Análisis de personajes y trama', 2, 2),
('Mapa Conceptual Historia', 'Recurso Visual', 'PNG', '[http://ejemplo.com/mapa_historia.png](http://ejemplo.com/mapa_historia.png)', '2024-05-05 09:00:00', 'Representación visual', 'Organizar eventos históricos', 'Básica', 'Colores contrastantes', 'Secuencia cronológica de eventos', 6, 3);

-- 9. Ensayo
INSERT INTO Ensayo (Tipo, Fecha, Resultado, ID_usuario) VALUES
('PSU Matemáticas', '2023-11-20', 650.50, 1), -- Juan Pérez rinde ensayo
('PAES Lenguaje', '2024-01-15', 720.00, 5), -- Sofía Ramírez rinde ensayo
('PSU Historia', '2023-11-20', 580.25, 1),
('PAES Ciencias', '2024-01-15', 680.75, 5);

-- 10. Reporte
INSERT INTO Reporte (Tipo, Contenido, Fecha, Generado_por, Para_usuario, Para_establecimiento, Para_comuna) VALUES
('Rendimiento Alumno', 'Reporte de notas de Juan Pérez', '2024-05-10 09:00:00', 2, 1, NULL, NULL), -- Generado por Docente María López para Alumno Juan Pérez
('Asistencia Mensual', 'Resumen de asistencia de Marzo 2024', '2024-04-05 16:00:00', 4, NULL, 1, NULL), -- Generado por Funcionario Carlos González para Colegio San Juan
('Comportamiento', 'Observación de comportamiento de Sofía Ramírez', '2024-05-15 11:00:00', 6, 5, NULL, NULL),
('General Colegio', 'Reporte anual de gestión 2023', '2024-01-30 10:00:00', 2, NULL, 1, NULL);

-- 11. Asistencia
INSERT INTO Asistencia (Fecha, Presente, Justificada, ID_usuario) VALUES
('2024-05-20', TRUE, FALSE, 1),
('2024-05-20', TRUE, FALSE, 5),
('2024-05-21', TRUE, FALSE, 1),
('2024-05-21', TRUE, FALSE, 5);

-- 12. Inasistencia
INSERT INTO Inasistencia (Fecha, Justificada, ID_usuario) VALUES
('2024-05-19', TRUE, 1),
('2024-05-18', FALSE, 5),
('2024-05-17', TRUE, 1),
('2024-05-16', FALSE, 5);

-- 13. Historial de matrícula
INSERT INTO Historial_matricula (ID_usuario, ID_establecimiento, Fecha_ingreso, Fecha_retiro, Motivo_retiro) VALUES
(1, 1, '2015-03-01', NULL, NULL),
(5, 2, '2019-03-05', NULL, NULL),
(1, 3, '2010-03-01', '2014-12-31', 'Cambio de domicilio'), -- Ejemplo de historial previo
(5, 1, '2018-03-01', '2018-12-31', 'No se adaptó');

-- 14. Accidente Escolar
INSERT INTO Accidente_escolar (Fecha, Descripcion, Tipo_lesion, Lugar, Fue_derivado, ID_usuario) VALUES
('2024-04-10', 'Caída en el patio durante recreo', 'Esguince de tobillo', 'Patio principal', TRUE, 1),
('2024-03-05', 'Golpe en la cabeza con un balón', 'Contusión leve', 'Cancha de fútbol', FALSE, 5),
('2024-02-15', 'Corte en la mano con tijeras', 'Herida superficial', 'Sala de arte', FALSE, 1),
('2024-01-20', 'Caída en las escaleras', 'Hematoma en la rodilla', 'Escalera principal', TRUE, 5);

-- 15. Notas
INSERT INTO Notas (Nota, Fecha, ID_usuario, ID_asignatura) VALUES
(6.5, '2024-05-10', 1, 1), -- Juan Pérez tiene un 6.5 en Matemáticas
(5.8, '2024-05-12', 5, 2), -- Sofía Ramírez tiene un 5.8 en Lenguaje
(7.0, '2024-04-20', 1, 3),
(6.0, '2024-04-22', 5, 4);

-- 16. Mensaje
INSERT INTO Mensaje (Destinatario_tipo, Contenido, Fecha_envio, Asunto, Prioridad, ID_usuario, ID_rol, ID_establecimiento) VALUES
('Apoderado', 'Recordatorio reunión de apoderados', '2024-05-15 17:00:00', 'Reunión Importante', 'Alta', 2, NULL, 1), -- Mensaje de Docente a Apoderados del Establecimiento 1
('Docente', 'Cambio de horario de clases', '2024-05-14 09:30:00', 'Aviso de Horario', 'Media', 4, NULL, 2), -- Mensaje de Funcionario a Docentes del Establecimiento 2
('Alumno', 'Entrega de trabajos atrasados', '2024-05-13 10:00:00', 'Tareas Pendientes', 'Normal', 6, NULL, 2),
('Administrador', 'Solicitud de material de oficina', '2024-05-12 11:00:00', 'Materiales', 'Baja', 2, NULL, 1);

-- 17. Apoderado_Alumno
INSERT INTO Apoderado_Alumno (ID_apoderado_fk, ID_alumno_fk, Parentezco) VALUES
(3, 1, 'Madre'),     -- Ana Martínez (ID_usuario 3) es madre de Juan Pérez (ID_usuario 1)
(3, 5, 'Tía');       -- Ana Martínez (ID_usuario 3) es tía de Sofía Ramírez (ID_usuario 5)