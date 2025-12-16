# Guía Rápida: Configurar Google Drive

## Pasos Rápidos

### 1. Crear Proyecto y Service Account (5 minutos)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo: "Vielca Fotos"
3. Habilita **Google Drive API**:
   - APIs & Services → Library → Busca "Google Drive API" → Enable
4. Crea Service Account:
   - APIs & Services → Credentials → Create Credentials → Service Account
   - Nombre: `vielca-fotos-drive`
   - Role: `Editor`
   - Crea y descarga la clave JSON

### 2. Crear Carpeta en Drive (2 minutos)

1. Ve a [Google Drive](https://drive.google.com/)
2. Crea carpeta: "Vielca Fotos 10 Años"
3. Comparte la carpeta con el email de la Service Account:
   - Email está en el archivo JSON: `client_email`
   - Ejemplo: `vielca-fotos-drive@tu-proyecto.iam.gserviceaccount.com`
   - Permisos: Editor
4. Obtén el ID de la carpeta:
   - Abre la carpeta
   - URL: `https://drive.google.com/drive/folders/1ABC123xyz...`
   - El ID es: `1ABC123xyz...`

### 3. Configurar Variables de Entorno

#### Local (PowerShell)

Edita `setup-local.ps1`:

```powershell
$env:GOOGLE_DRIVE_FOLDER_ID="TU_ID_DE_CARPETA"
$env:GOOGLE_SERVICE_ACCOUNT_PATH="C:\ruta\al\service-account.json"
```

#### Vercel

En Vercel → Settings → Environment Variables:

1. `GOOGLE_DRIVE_FOLDER_ID` = `tu-id-de-carpeta`
2. `GOOGLE_SERVICE_ACCOUNT` = (pega todo el contenido del JSON como una línea)

Para obtener el JSON como string:
- Abre el archivo JSON
- Copia todo el contenido
- Pégalo en Vercel (debe ser una sola línea sin saltos)

### 4. Ejecutar

```powershell
.\setup-local.ps1
```

O manualmente:

```powershell
$env:GOOGLE_DRIVE_FOLDER_ID="tu-id"
$env:GOOGLE_SERVICE_ACCOUNT_PATH="ruta\al\archivo.json"
npm start
```

## Solución de Problemas

### Error: "Google Drive no está configurado"
- Verifica que `GOOGLE_DRIVE_FOLDER_ID` esté configurado
- Verifica que `GOOGLE_SERVICE_ACCOUNT_PATH` apunte al archivo JSON correcto

### Error: "Error accediendo a la carpeta de Drive"
- Verifica que compartiste la carpeta con el email de la Service Account
- Verifica que el ID de la carpeta sea correcto

### Las fotos no aparecen
- Verifica que las fotos se subieron correctamente a Drive
- Revisa la consola del servidor para ver errores
- Verifica que la carpeta tenga permisos públicos (opcional pero recomendado)

## Ventajas vs MySQL

✅ **Ilimitado**: 15GB gratis (miles de fotos)  
✅ **Sin límites de conexión**: No hay problemas de conexiones simultáneas  
✅ **Público**: Fácil de compartir  
✅ **Gratis**: Sin costos adicionales  
✅ **Simple**: No requiere base de datos


