# Visualizador de Fotos - Vielca Ingenieros 10 Años

Aplicación web para visualizar y descargar fotos PNG en celebración del 10º aniversario de Vielca Ingenieros.

## Características

- ✅ Subida de múltiples fotos PNG
- ✅ Galería visual moderna y responsive
- ✅ Descarga individual de fotos
- ✅ Almacenamiento en MySQL
- ✅ Despliegue en Vercel

## Instalación Local

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
   - Copia `.env.example` a `.env`
   - Completa con tus credenciales de MySQL

4. Inicia el servidor:
```bash
npm start
```

5. Abre `http://localhost:3000` en tu navegador

## Despliegue en Vercel

### Paso 1: Preparar el proyecto

Asegúrate de tener todos los archivos en Git:
```bash
git add .
git commit -m "Preparado para Vercel"
```

### Paso 2: Conectar con Vercel

1. Instala Vercel CLI (opcional):
```bash
npm i -g vercel
```

2. O conecta tu repositorio desde [vercel.com](https://vercel.com)

### Paso 3: Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto → Settings → Environment Variables y añade:

**Variables de MySQL:**
- `DB_HOST` = tu-host-mysql (ej: bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com)
- `DB_PORT` = 3306
- `DB_USER` = tu-usuario-mysql
- `DB_PASSWORD` = tu-contraseña-mysql
- `DB_NAME` = tu-base-de-datos

**Control de subida de fotos:**
- `ENABLE_UPLOAD` = `false` (para deshabilitar la subida en producción, solo visualización y descarga)
  - Si no pones esta variable, la subida estará habilitada por defecto
  - En producción normalmente querrás ponerla a `false` para que solo se puedan ver y descargar fotos

### Paso 4: Desplegar

Si usas CLI:
```bash
vercel --prod
```

O simplemente haz push a tu repositorio conectado y Vercel desplegará automáticamente.

## Estructura del Proyecto

```
VisualizadorFotos/
├── server.js          # Servidor Express principal
├── vercel.json        # Configuración de Vercel
├── package.json       # Dependencias Node.js
├── public/            # Archivos estáticos
│   ├── index.html     # Página principal
│   ├── styles.css     # Estilos
│   └── app.js         # JavaScript del frontend
├── uploads/           # Fotos subidas (solo local)
└── .env.example       # Ejemplo de variables de entorno
```

## Base de Datos MySQL

La aplicación crea automáticamente la tabla `photos` con la siguiente estructura:

```sql
CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Control de Subida de Fotos

La aplicación permite controlar si los usuarios pueden subir fotos o solo visualizarlas/descargarlas:

- **Por defecto**: La subida está **habilitada** (puedes subir fotos)
- **Para deshabilitar**: Añade la variable de entorno `ENABLE_UPLOAD=false` en Vercel
  - Cuando está deshabilitada, los botones de subida se ocultan automáticamente
  - Los usuarios solo pueden ver la galería y descargar fotos

**Uso recomendado:**
- **Local**: Deja sin configurar (habilitado) para poder subir fotos durante desarrollo
- **Producción**: Configura `ENABLE_UPLOAD=false` en Vercel para que solo se puedan ver/descargar fotos

## Notas Importantes

- En Vercel, los archivos se almacenan temporalmente en `/tmp` (solo durante la ejecución de la función)
- Para producción, considera usar un servicio de almacenamiento como AWS S3, Cloudinary o Vercel Blob Storage
- Las fotos subidas en Vercel no persisten entre despliegues (son serverless)

## Tecnologías Utilizadas

- Node.js + Express
- MySQL (mysql2)
- Multer (subida de archivos)
- HTML/CSS/JavaScript vanilla

## Licencia

ISC

