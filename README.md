# Visualizador de Fotos - Vielca Ingenieros 10 Años

Aplicación web para visualizar y descargar fotos PNG/JPG en celebración del 10º aniversario de Vielca Ingenieros.

## Características

- ✅ Subida de múltiples fotos PNG/JPG en lote
- ✅ Galería visual moderna y responsive
- ✅ Descarga individual de fotos
- ✅ Almacenamiento permanente en MySQL (Clever Cloud)
- ✅ Las fotos se guardan como BLOB en MySQL
- ✅ Despliegue en Vercel

## Instalación Local

### Opción 1: Script Automático (Recomendado)

```powershell
.\setup-local.ps1
```

### Opción 2: Manual

1. **Instala las dependencias:**
```bash
npm install
```

2. **Configura las variables de entorno** (PowerShell):
```powershell
$env:MYSQL_ADDON_HOST="b3nk42c7ffxjml0xmqrv-mysql.services.clever-cloud.com"
$env:MYSQL_ADDON_PORT="3306"
$env:MYSQL_ADDON_USER="umnkr3fewyhygios"
$env:MYSQL_ADDON_PASSWORD="bTeExcydXtflZIFBKpmC"
$env:MYSQL_ADDON_DB="b3nk42c7ffxjml0xmqrv"
$env:ENABLE_UPLOAD="true"
$env:PORT="3000"
```

3. **Inicia el servidor:**
```bash
npm start
```

4. **Abre** `http://localhost:3000` en tu navegador

## Configuración de Base de Datos

### Crear la Tabla en MySQL

Ejecuta el script `setup.sql` en tu cliente MySQL (MySQL Workbench, phpMyAdmin):

**Credenciales de Clever Cloud:**
- Host: `b3nk42c7ffxjml0xmqrv-mysql.services.clever-cloud.com`
- Port: `3306`
- User: `umnkr3fewyhygios`
- Password: `bTeExcydXtflZIFBKpmC`
- Database: `b3nk42c7ffxjml0xmqrv`

El script creará automáticamente la tabla `photos` con todas las columnas necesarias.

## Despliegue en Vercel

### Paso 1: Conectar Repositorio

Conecta tu repositorio Git con Vercel desde [vercel.com](https://vercel.com)

### Paso 2: Configurar Variables de Entorno

En Vercel → Settings → Environment Variables, añade:

**Variables de Clever Cloud MySQL:**
```
MYSQL_ADDON_HOST = b3nk42c7ffxjml0xmqrv-mysql.services.clever-cloud.com
MYSQL_ADDON_PORT = 3306
MYSQL_ADDON_USER = umnkr3fewyhygios
MYSQL_ADDON_PASSWORD = bTeExcydXtflZIFBKpmC
MYSQL_ADDON_DB = b3nk42c7ffxjml0xmqrv
```

**Control de subida:**
```
ENABLE_UPLOAD = false
```
(Pon `false` en producción para deshabilitar la subida, solo visualización y descarga)

### Paso 3: Desplegar

Vercel detectará automáticamente el proyecto y lo desplegará. O haz push a tu repositorio.

## Estructura del Proyecto

```
VisualizadorFotos/
├── server.js              # Servidor Express principal
├── vercel.json            # Configuración de Vercel
├── package.json           # Dependencias Node.js
├── setup-local.ps1        # Script para configurar y ejecutar local
├── setup.sql              # Script SQL para crear tabla
├── public/                # Archivos estáticos
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos
│   └── app.js             # JavaScript del frontend
└── README.md              # Este archivo
```

## Base de Datos MySQL

La tabla `photos` tiene la siguiente estructura:

```sql
CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(512) NULL,
  image_data LONGBLOB NULL,        -- Foto almacenada como BLOB
  mime_type VARCHAR(50) NULL,      -- Tipo de imagen (image/jpeg, image/png)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Nota:** Las fotos se almacenan directamente en MySQL como BLOB, por lo que están disponibles permanentemente.

## Uso

### Subir Fotos

1. Abre la aplicación (local o producción)
2. Haz clic en "Seleccionar fotos (PNG/JPG) - Puedes elegir múltiples"
3. Selecciona todas tus fotos (Ctrl+A o selección múltiple)
4. Haz clic en "Subir lote de fotos"
5. Las fotos se guardarán directamente en MySQL

### Visualizar y Descargar

- Haz clic en cualquier foto para verla en tamaño completo (lightbox)
- Usa el botón "⬇ Descargar" en cada foto para descargarla

## Tecnologías Utilizadas

- Node.js + Express
- MySQL (mysql2) - Clever Cloud
- Multer (subida de archivos)
- HTML/CSS/JavaScript vanilla
- Vercel (hosting)

## Licencia

ISC
