-- Script para crear nueva base de datos y tabla en Clever Cloud MySQL
-- Ejecuta estos comandos en tu cliente MySQL (MySQL Workbench, phpMyAdmin, etc.)

-- 1. Crear la nueva base de datos
CREATE DATABASE IF NOT EXISTS vielca_fotos_nueva
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Seleccionar la base de datos
USE vielca_fotos_nueva;

-- 3. Crear la tabla photos con todas las columnas necesarias
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

-- 4. Verificar que se creó correctamente
DESCRIBE photos;

-- 5. Ver información de la base de datos
SHOW DATABASES LIKE 'vielca_fotos%';

