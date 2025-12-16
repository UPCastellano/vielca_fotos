-- Script para actualizar la tabla photos en MySQL de Clever Cloud
-- Ejecuta estos comandos en tu MySQL de Clever Cloud

-- 1. Hacer la columna 'url' nullable (porque ahora puede ser NULL si la foto está en image_data)
ALTER TABLE photos MODIFY COLUMN url VARCHAR(512) NULL;

-- 2. Añadir columna image_data (ignora el error si ya existe)
ALTER TABLE photos ADD COLUMN image_data LONGBLOB NULL;

-- 3. Añadir columna mime_type (ignora el error si ya existe)
ALTER TABLE photos ADD COLUMN mime_type VARCHAR(50) NULL;

-- 4. Verificar que las columnas se añadieron correctamente
DESCRIBE photos;

-- 5. Ver todas las fotos actuales (opcional)
SELECT id, filename, url, mime_type, created_at FROM photos ORDER BY created_at DESC;

