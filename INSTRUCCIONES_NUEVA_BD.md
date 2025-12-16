# Instrucciones para Crear Nueva Base de Datos en Clever Cloud MySQL

## Paso 1: Obtener Credenciales de la Nueva Base de Datos

1. Ve a tu panel de Clever Cloud
2. Crea un nuevo add-on MySQL (o usa una instancia existente)
3. Anota las nuevas credenciales:
   - **Host**: `tu-nuevo-host-mysql.services.clever-cloud.com`
   - **Port**: `3306`
   - **User**: `tu-nuevo-usuario`
   - **Password**: `tu-nueva-contraseña`
   - **Database**: `tu-nueva-base-de-datos` (o créala con el script SQL)

## Paso 2: Crear la Base de Datos y Tabla

### Opción A: Usando MySQL Workbench (Recomendado)

1. **Descarga MySQL Workbench** (si no lo tienes):
   - https://dev.mysql.com/downloads/workbench/

2. **Conecta a tu MySQL de Clever Cloud** con las nuevas credenciales:
   - Host: `tu-nuevo-host-mysql.services.clever-cloud.com`
   - Port: `3306`
   - Username: `tu-nuevo-usuario`
   - Password: `tu-nueva-contraseña`

3. **Ejecuta el script SQL**:
   - Abre el archivo `crear_base_datos_nueva.sql`
   - Copia y pega los comandos en MySQL Workbench
   - Ejecuta el script (botón ⚡ o F9)

### Opción B: Desde la Línea de Comandos

```bash
mysql -h tu-nuevo-host-mysql.services.clever-cloud.com \
      -P 3306 \
      -u tu-nuevo-usuario \
      -ptu-nueva-contraseña \
      -e "CREATE DATABASE IF NOT EXISTS vielca_fotos_nueva CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

mysql -h tu-nuevo-host-mysql.services.clever-cloud.com \
      -P 3306 \
      -u tu-nuevo-usuario \
      -ptu-nueva-contraseña \
      vielca_fotos_nueva < crear_base_datos_nueva.sql
```

## Paso 3: Actualizar Variables de Entorno

### En Local (PowerShell):

```powershell
cd C:\Users\Equipo1\Desktop\PROYECTOS\VisualizadorFotos

$env:DB_HOST="tu-nuevo-host-mysql.services.clever-cloud.com"
$env:DB_PORT="3306"
$env:DB_USER="tu-nuevo-usuario"
$env:DB_PASSWORD="tu-nueva-contraseña"
$env:DB_NAME="vielca_fotos_nueva"
```

### En Vercel:

1. Ve a tu proyecto en Vercel → Settings → Environment Variables
2. Actualiza las variables:
   - `DB_HOST` = tu-nuevo-host-mysql.services.clever-cloud.com
   - `DB_PORT` = 3306
   - `DB_USER` = tu-nuevo-usuario
   - `DB_PASSWORD` = tu-nueva-contraseña
   - `DB_NAME` = vielca_fotos_nueva

## Paso 4: Verificar que Funciona

Después de ejecutar el script SQL, deberías ver:

```
Database: vielca_fotos_nueva
Table: photos
Columns:
  - id (INT, PRIMARY KEY)
  - filename (VARCHAR(255))
  - url (VARCHAR(512), NULL)
  - image_data (LONGBLOB, NULL)
  - mime_type (VARCHAR(50), NULL)
  - created_at (TIMESTAMP)
```

## Nota sobre Conexiones

Si sigues teniendo problemas de conexiones:
- Cierra todas las conexiones activas antes de crear la nueva
- Considera usar un pool de conexiones más pequeño
- Verifica los límites de tu plan de Clever Cloud MySQL

