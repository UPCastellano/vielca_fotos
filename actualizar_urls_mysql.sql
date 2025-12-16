-- Script para actualizar URLs de fotos en MySQL
-- Reemplaza 'nombre-foto.jpg' con el nombre real de tu foto
-- y 'https://i.imgur.com/tu-foto.jpg' con la URL real de la foto

-- Ejemplo para una foto:
UPDATE photos 
SET url = 'https://i.imgur.com/tu-foto.jpg' 
WHERE filename = 'nombre-foto.jpg';

-- Para actualizar múltiples fotos, ejecuta un UPDATE por cada una:
-- UPDATE photos SET url = 'https://i.imgur.com/foto1.jpg' WHERE filename = 'foto1.jpg';
-- UPDATE photos SET url = 'https://i.imgur.com/foto2.jpg' WHERE filename = 'foto2.jpg';
-- UPDATE photos SET url = 'https://i.imgur.com/foto3.jpg' WHERE filename = 'foto3.jpg';

-- Para ver todas las fotos actuales:
SELECT id, filename, url, created_at FROM photos ORDER BY created_at DESC;

