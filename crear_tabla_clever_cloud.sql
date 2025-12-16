-- Script para crear la tabla photos en Clever Cloud MySQL
-- Base de datos: b3nk42c7ffxjml0xmqrv
-- Ejecuta estos comandos en tu cliente MySQL

-- 1. Seleccionar la base de datos (ya existe en Clever Cloud)
USE b3nk42c7ffxjml0xmqrv;

-- 2. Crear la tabla photos con todas las columnas necesarias
CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(512) NULL,
  image_data LONGBLOB NULL,
  mime_type VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_filename (filename),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Verificar que se creó correctamente
DESCRIBE photos;

-- 4. Ver todas las tablas en la base de datos
SHOW TABLES;

