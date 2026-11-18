-- =====================================================================
-- Plataforma de Gestión y Seguimiento de Proyectos de Investigación
-- Script SQL del modelo E-R (MySQL 8)
-- Autor: Germán Cárdenas — módulo Colaborador + datos
--
-- Traduce las colecciones de frontend/db.json (JSON Server) a tablas
-- relacionales para la siguiente etapa (backend Express + MySQL).
-- Ejecutar:  mysql -u root -p < database/modelo.sql
-- =====================================================================

DROP DATABASE IF EXISTS plataforma_investigacion;
CREATE DATABASE plataforma_investigacion CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE plataforma_investigacion;

-- ---------------------------------------------------------------------
-- ROL: admin, investigador, colaborador
-- ---------------------------------------------------------------------
CREATE TABLE rol (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- USUARIO (RN-16: no se elimina, se desactiva con "activo")
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  correo        VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,          -- en el backend real: bcrypt
  rol_id        INT NOT NULL,
  especialidad  VARCHAR(100),
  institucion   VARCHAR(100),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
);

-- ---------------------------------------------------------------------
-- PROYECTO (RN-01: requiere investigador responsable -> lider_id NOT NULL)
--          (RN-12: el portal solo muestra es_publico = TRUE)
-- ---------------------------------------------------------------------
CREATE TABLE proyecto (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  titulo        VARCHAR(200) NOT NULL,
  objetivo      TEXT,
  fase_actual   VARCHAR(100),
  estado        ENUM('pendiente','activo','finalizado') NOT NULL DEFAULT 'pendiente',
  es_publico    BOOLEAN NOT NULL DEFAULT FALSE,
  lider_id      INT NOT NULL,
  fecha_inicio  DATE,
  fecha_fin     DATE,
  CONSTRAINT fk_proyecto_lider FOREIGN KEY (lider_id) REFERENCES usuario(id),
  CONSTRAINT ck_proyecto_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- ---------------------------------------------------------------------
-- PARTICIPACION: relación N:M entre USUARIO y PROYECTO
-- ---------------------------------------------------------------------
CREATE TABLE participacion (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  proyecto_id    INT NOT NULL,
  usuario_id     INT NOT NULL,
  funcion        VARCHAR(30) NOT NULL,
  fecha_ingreso  DATE,
  CONSTRAINT fk_part_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto(id),
  CONSTRAINT fk_part_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario(id),
  CONSTRAINT uq_participacion UNIQUE (proyecto_id, usuario_id)
);

-- ---------------------------------------------------------------------
-- ETAPA: fases del proyecto (carta Gantt)
-- ---------------------------------------------------------------------
CREATE TABLE etapa (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  proyecto_id   INT NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  orden         INT NOT NULL,
  fecha_inicio  DATE NOT NULL,
  fecha_fin     DATE NOT NULL,
  CONSTRAINT fk_etapa_proyecto FOREIGN KEY (proyecto_id) REFERENCES proyecto(id) ON DELETE CASCADE,
  CONSTRAINT ck_etapa_fechas CHECK (fecha_fin >= fecha_inicio)
);

-- ---------------------------------------------------------------------
-- TAREA (RN-07: responsable, plazo y estado obligatorios)
--       (RN-09: "atrasada" NO se guarda, se calcula -> ver vista abajo)
-- ---------------------------------------------------------------------
CREATE TABLE tarea (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  etapa_id        INT NOT NULL,
  proyecto_id     INT NOT NULL,
  nombre          VARCHAR(150) NOT NULL,
  descripcion     TEXT,
  responsable_id  INT NOT NULL,
  fecha_limite    DATE NOT NULL,
  prioridad       ENUM('alta','media','baja') NOT NULL DEFAULT 'media',
  estado          ENUM('pendiente','por_revisar','cumplida') NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_tarea_etapa       FOREIGN KEY (etapa_id)       REFERENCES etapa(id),
  CONSTRAINT fk_tarea_proyecto    FOREIGN KEY (proyecto_id)    REFERENCES proyecto(id),
  CONSTRAINT fk_tarea_responsable FOREIGN KEY (responsable_id) REFERENCES usuario(id)
);

-- ---------------------------------------------------------------------
-- ARCHIVO: entregables de una tarea (se guardan en Google Drive)
-- ---------------------------------------------------------------------
CREATE TABLE archivo (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tarea_id    INT NOT NULL,
  nombre      VARCHAR(200) NOT NULL,
  drive_url   VARCHAR(500) NOT NULL,
  subido_por  INT NOT NULL,
  subido_en   DATE NOT NULL,
  version     INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_archivo_tarea   FOREIGN KEY (tarea_id)   REFERENCES tarea(id) ON DELETE CASCADE,
  CONSTRAINT fk_archivo_usuario FOREIGN KEY (subido_por) REFERENCES usuario(id)
);

-- ---------------------------------------------------------------------
-- HISTORIAL (RN-13: cambios relevantes quedan registrados)
-- ---------------------------------------------------------------------
CREATE TABLE historial (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  usuario  VARCHAR(100) NOT NULL,
  entidad  VARCHAR(30)  NOT NULL,
  accion   VARCHAR(300) NOT NULL,
  fecha    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para las consultas más usadas
CREATE INDEX idx_tarea_responsable ON tarea(responsable_id);
CREATE INDEX idx_tarea_proyecto    ON tarea(proyecto_id);
CREATE INDEX idx_etapa_proyecto    ON etapa(proyecto_id);

-- ---------------------------------------------------------------------
-- VISTA: estado visible de la tarea (RN-09, igual que estadoVisible() en tareasApi.js)
-- ---------------------------------------------------------------------
CREATE VIEW v_tarea_estado AS
SELECT t.*,
       CASE WHEN t.estado <> 'cumplida' AND t.fecha_limite < CURDATE()
            THEN 'atrasada' ELSE t.estado END AS estado_visible
FROM tarea t;

-- =====================================================================
-- DATOS DE PRUEBA (mismos que frontend/db.json)
-- =====================================================================
INSERT INTO rol (id, nombre) VALUES (1,'admin'), (2,'investigador'), (3,'colaborador');

-- Contraseña '1234' solo para el prototipo; en el backend se guardará el hash bcrypt
INSERT INTO usuario (id, nombre, correo, password_hash, rol_id, especialidad, institucion, activo) VALUES
 (1,'Administrador','admin@unach.cl','1234',1,'','UNACH',TRUE),
 (2,'Dra. Ana Pérez','aperez@unach.cl','1234',2,'Educación','UNACH',TRUE),
 (3,'Dr. Luis Muñoz','lmunoz@unach.cl','1234',2,'Informática','UNACH',TRUE),
 (4,'Juan Soto','jsoto@unach.cl','1234',3,'Psicología','UNACH',TRUE),
 (5,'María López','mlopez@unach.cl','1234',3,'Estadística','UNACH',TRUE);

INSERT INTO proyecto (id, titulo, objetivo, fase_actual, estado, es_publico, lider_id, fecha_inicio, fecha_fin) VALUES
 (1,'Hábitos de estudio en estudiantes de primer año','Analizar los hábitos de estudio de los estudiantes de primer año y su relación con el rendimiento académico.','Comité de ética','activo',TRUE,2,'2026-09-01','2027-02-28'),
 (2,'Uso de IA en la educación rural','Evaluar el impacto de herramientas de inteligencia artificial en escuelas rurales de Ñuble.','Planificación','activo',TRUE,3,'2026-10-01','2027-06-30'),
 (3,'Calidad del agua en Chillán','Medir parámetros de calidad del agua en distintos sectores de la ciudad.','Planificación','pendiente',FALSE,2,'2026-11-15','2027-08-30');

INSERT INTO participacion (id, proyecto_id, usuario_id, funcion, fecha_ingreso) VALUES
 (1,1,4,'colaborador','2026-09-01'),
 (2,1,5,'colaborador','2026-09-10'),
 (3,2,5,'colaborador','2026-10-01');

INSERT INTO etapa (id, proyecto_id, nombre, orden, fecha_inicio, fecha_fin) VALUES
 (1,1,'Planificación',1,'2026-09-01','2026-09-30'),
 (2,1,'Comité de ética',2,'2026-10-01','2026-11-30'),
 (3,1,'Recolección de datos',3,'2026-12-01','2027-01-31'),
 (4,1,'Informe final',4,'2027-02-01','2027-02-28'),
 (5,2,'Planificación',1,'2026-10-01','2026-12-15'),
 (6,2,'Trabajo de campo',2,'2026-12-16','2027-04-30');

INSERT INTO tarea (id, etapa_id, proyecto_id, nombre, descripcion, responsable_id, fecha_limite, prioridad, estado) VALUES
 (1,1,1,'Carta de compromiso','Firmar carta de compromiso del equipo.',4,'2026-09-20','media','cumplida'),
 (2,2,1,'Documento para comité de ética','Redactar el documento para presentar al comité de ética.',4,'2026-11-20','alta','por_revisar'),
 (3,2,1,'Revisión bibliográfica','Buscar al menos 15 artículos sobre hábitos de estudio.',5,'2026-12-05','media','pendiente'),
 (4,2,1,'Diseño de encuesta','Primera versión de la encuesta para estudiantes.',5,'2026-11-10','alta','pendiente'),
 (5,5,2,'Listado de escuelas','Identificar escuelas rurales participantes.',5,'2026-12-01','media','pendiente');

INSERT INTO archivo (id, tarea_id, nombre, drive_url, subido_por, subido_en, version) VALUES
 (1,1,'carta_compromiso.pdf','https://drive.google.com/',4,'2026-09-18',1),
 (2,2,'documento_etica_v1.docx','https://drive.google.com/',4,'2026-11-16',1);

INSERT INTO historial (id, usuario, entidad, accion, fecha) VALUES
 (1,'Juan Soto','tarea','Subió archivo a "Documento para comité de ética"','2026-11-16 10:32:00'),
 (2,'Dra. Ana Pérez','tarea','Creó la tarea "Revisión bibliográfica"','2026-11-12 15:10:00'),
 (3,'Administrador','proyecto','Creó el proyecto "Calidad del agua en Chillán"','2026-11-10 09:00:00');

-- =====================================================================
-- CONSULTA DE EJEMPLO: "Mis tareas" de María López (id 5),
-- ordenadas por prioridad y fecha, igual que la vista MisTareas.vue
-- =====================================================================
-- SELECT v.nombre, p.titulo, v.prioridad, v.fecha_limite, v.estado_visible
-- FROM v_tarea_estado v JOIN proyecto p ON p.id = v.proyecto_id
-- WHERE v.responsable_id = 5
-- ORDER BY FIELD(v.prioridad,'alta','media','baja'), v.fecha_limite;
