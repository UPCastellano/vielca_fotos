# Visualizador de Fotos - Vielca Ingenieros 10 Años

Aplicación web para visualizar y descargar fotos PNG/JPG en celebración del 10º aniversario de Vielca Ingenieros.

## Características

- ✅ Subida de múltiples fotos PNG/JPG en lote
- ✅ Galería visual moderna y responsive
- ✅ Descarga individual de fotos
- ✅ Almacenamiento en Google Drive (ilimitado y gratuito)
- ✅ Las fotos se guardan directamente en Google Drive
- ✅ Despliegue en Vercel

## Configuración de Google Drive

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Drive API**:
   - Ve a "APIs & Services" → "Library"
   - Busca "Google Drive API"
   - Haz clic en "Enable"

### Paso 2: Crear Service Account

1. Ve a "APIs & Services" → "Credentials"
2. Haz clic en "Create Credentials" → "Service Account"
3. Completa el formulario:
   - **Name**: `vielca-fotos-drive`
   - **Role**: `Editor` (o `Owner`)
4. Haz clic en "Done"
5. En la lista de Service Accounts, haz clic en la que acabas de crear
6. Ve a la pestaña "Keys"
7. Haz clic en "Add Key" → "Create new key"
8. Selecciona formato **JSON** y descarga el archivo
9. **Guarda este archivo de forma segura** - contiene credenciales importantes

### Paso 3: Crear Carpeta en Google Drive

1. Ve a [Google Drive](https://drive.google.com/)
2. Crea una nueva carpeta llamada "Vielca Fotos 10 Años" (o el nombre que prefieras)
3. Haz clic derecho en la carpeta → "Compartir"
4. En "Compartir con personas y grupos", pega el **email de la Service Account**
   - El email tiene formato: `nombre-service-account@proyecto-id.iam.gserviceaccount.com`
   - Lo encontrarás en el archivo JSON descargado (campo `client_email`)
5. Dale permisos de **Editor** o **Lector y Editor**
6. Haz clic en "Enviar"
7. **Haz la carpeta pública** (opcional pero recomendado):
   - Haz clic derecho en la carpeta → "Compartir"
   - Cambia "Restringido" a "Cualquiera con el enlace"
   - Guarda los cambios

### Paso 4: Obtener ID de la Carpeta

1. Abre la carpeta en Google Drive
2. La URL será algo como: `https://drive.google.com/drive/folders/1ABC123xyz...`
3. El **ID de la carpeta** es la parte después de `/folders/`
   - Ejemplo: `1ABC123xyz...`

## Instalación Local

### Opción 1: Script Automático (Recomendado)

1. Edita `setup-local.ps1` y configura las variables:
   ```powershell
   $env:GOOGLE_DRIVE_FOLDER_ID="TU_ID_DE_CARPETA"
   $env:GOOGLE_SERVICE_ACCOUNT_PATH="ruta/al/archivo-service-account.json"
   ```

2. Ejecuta:
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
   # ID de la carpeta de Google Drive
   $env:GOOGLE_DRIVE_FOLDER_ID="TU_ID_DE_CARPETA"
   
   # Ruta al archivo JSON de Service Account
   $env:GOOGLE_SERVICE_ACCOUNT_PATH="C:\ruta\al\service-account.json"
   
   # O si prefieres pasar el JSON como string (menos recomendado)
   # $env:GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   
   # Habilitar subida
   $env:ENABLE_UPLOAD="true"
   
   # Puerto del servidor
   $env:PORT="3000"
   ```

3. **Inicia el servidor:**
   ```bash
   npm start
   ```

4. **Abre** `http://localhost:3000` en tu navegador

## Despliegue en Vercel

### Paso 1: Conectar Repositorio

Conecta tu repositorio Git con Vercel desde [vercel.com](https://vercel.com)

### Paso 2: Configurar Variables de Entorno

En Vercel → Settings → Environment Variables, añade:

**Variables de Google Drive:**
```
GOOGLE_DRIVE_FOLDER_ID = tu-id-de-carpeta-de-drive
GOOGLE_SERVICE_ACCOUNT = {"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Nota:** Para `GOOGLE_SERVICE_ACCOUNT`, pega el contenido completo del archivo JSON descargado como una sola línea (sin saltos de línea).

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
├── public/                # Archivos estáticos
│   ├── index.html         # Página principal
│   ├── styles.css         # Estilos
│   └── app.js             # JavaScript del frontend
└── README.md              # Este archivo
```

## Uso

### Subir Fotos

1. Abre la aplicación (local o producción)
2. Haz clic en "Seleccionar fotos (PNG/JPG) - Puedes elegir múltiples"
3. Selecciona todas tus fotos (Ctrl+A o selección múltiple)
4. Haz clic en "Subir lote de fotos"
5. Las fotos se guardarán directamente en Google Drive

### Visualizar y Descargar

- Haz clic en cualquier foto para verla en tamaño completo (lightbox)
- Usa el botón "⬇ Descargar" en cada foto para descargarla

## Ventajas de Google Drive

- ✅ **Ilimitado**: Google Drive ofrece 15GB gratis (suficiente para miles de fotos)
- ✅ **Público**: Las fotos se pueden compartir fácilmente
- ✅ **Accesible**: No requiere base de datos ni servidor de almacenamiento
- ✅ **Confiable**: Infraestructura de Google
- ✅ **Gratis**: Sin costos adicionales

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `GOOGLE_DRIVE_FOLDER_ID` | ID de la carpeta en Google Drive | Sí |
| `GOOGLE_SERVICE_ACCOUNT` | JSON de credenciales como string | Sí* |
| `GOOGLE_SERVICE_ACCOUNT_PATH` | Ruta al archivo JSON de credenciales | Sí* |
| `ENABLE_UPLOAD` | Habilitar/deshabilitar subida (`true`/`false`) | No |
| `PORT` | Puerto del servidor (default: 3000) | No |

*Usa una de las dos opciones: `GOOGLE_SERVICE_ACCOUNT` (string) o `GOOGLE_SERVICE_ACCOUNT_PATH` (ruta a archivo)

## Tecnologías Utilizadas

- Node.js + Express
- Google Drive API v3
- Multer (subida de archivos)
- HTML/CSS/JavaScript vanilla
- Vercel (hosting)

## Licencia

ISC
