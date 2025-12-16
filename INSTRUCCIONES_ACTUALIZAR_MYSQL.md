# Instrucciones para Actualizar MySQL en Clever Cloud

## Opción 1: Usando MySQL Workbench (Recomendado)

1. **Descarga MySQL Workbench** (si no lo tienes):
   - https://dev.mysql.com/downloads/workbench/

2. **Conecta a tu MySQL de Clever Cloud**:
   - Host: `bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com`
   - Port: `3306`
   - Username: `uht4tll0gf9lyffl`
   - Password: `5hi8TfIe8tqGsWIxOvIb`
   - Database: `bgdoaasgoznr2hmdj24v`

3. **Ejecuta el script SQL**:
   - Abre el archivo `actualizar_tabla_mysql.sql`
   - Copia y pega los comandos en MySQL Workbench
   - Ejecuta el script (botón ⚡ o F9)

## Opción 2: Usando phpMyAdmin (si Clever Cloud lo ofrece)

1. Accede a phpMyAdmin desde el panel de Clever Cloud
2. Selecciona tu base de datos
3. Ve a la pestaña "SQL"
4. Pega los comandos del archivo `actualizar_tabla_mysql.sql`
5. Ejecuta

## Opción 3: Desde la línea de comandos (CLI)

```bash
mysql -h bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com \
      -P 3306 \
      -u uht4tll0gf9lyffl \
      -p5hi8TfIe8tqGsWIxOvIb \
      bgdoaasgoznr2hmdj24v < actualizar_tabla_mysql.sql
```

## Opción 4: El código se actualiza automáticamente

**¡Buenas noticias!** El código que ya subimos a Git/Vercel tiene esta línea:

```javascript
CREATE TABLE IF NOT EXISTS photos (
  ...
  image_data LONGBLOB,
  mime_type VARCHAR(50),
  ...
)
```

**PERO** esto solo funciona si la tabla NO existe. Si ya existe, necesitas ejecutar el ALTER TABLE manualmente.

## Comandos SQL que necesitas ejecutar:

```sql
-- Hacer url nullable
ALTER TABLE photos MODIFY COLUMN url VARCHAR(512) NULL;

-- Añadir image_data
ALTER TABLE photos ADD COLUMN image_data LONGBLOB NULL;

-- Añadir mime_type  
ALTER TABLE photos ADD COLUMN mime_type VARCHAR(50) NULL;
```

## Verificar que funcionó:

```sql
DESCRIBE photos;
```

Deberías ver las columnas: `id`, `filename`, `url`, `image_data`, `mime_type`, `created_at`

