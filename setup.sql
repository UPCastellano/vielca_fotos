-- Script SQL para crear la tabla photos en Clever Cloud MySQL
-- Base de datos: b3nk42c7ffxjml0xmqrv

USE b3nk42c7ffxjml0xmqrv;

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

-- Verificar
DESCRIBE photos;

