# ⚠️ Instrucciones Importantes sobre Credenciales

## Problema Detectado

El archivo de credenciales que proporcionaste (`client_secret_*.json`) es de tipo **OAuth 2.0 (Web Application)**, pero este proyecto necesita un **Service Account** para funcionar correctamente.

## ¿Por qué Service Account?

- **Service Account** permite acceso automático y continuo a Google Drive sin necesidad de autenticación del usuario
- **OAuth 2.0** requiere que un usuario inicie sesión cada vez, lo cual no es práctico para una aplicación de servidor

## Solución: Crear un Service Account

### Paso 1: Crear Service Account en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto: **vielcafotos**
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en **Create Credentials** → **Service Account**
5. Completa el formulario:
   - **Name**: `vielca-fotos-drive`
   - **Role**: `Editor` o `Owner`
6. Haz clic en **Done**

### Paso 2: Crear y Descargar la Clave JSON

1. En la lista de Service Accounts, haz clic en la que acabas de crear (`vielca-fotos-drive`)
2. Ve a la pestaña **Keys**
3. Haz clic en **Add Key** → **Create new key**
4. Selecciona formato **JSON** y haz clic en **Create**
5. Se descargará un archivo JSON (algo como `vielcafotos-xxxxx.json`)

### Paso 3: Compartir la Carpeta con el Service Account

1. Abre la carpeta en Google Drive: https://drive.google.com/drive/folders/1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb
2. Haz clic derecho en la carpeta → **Compartir**
3. En el archivo JSON descargado, busca el campo `client_email` (algo como `vielca-fotos-drive@vielcafotos.iam.gserviceaccount.com`)
4. Pega ese email en "Compartir con personas y grupos"
5. Dale permisos de **Editor**
6. Haz clic en **Enviar**

### Paso 4: Reemplazar el Archivo de Credenciales

1. Mueve el archivo JSON del Service Account a la carpeta `credentials/`
2. Renómbralo a `service-account.json` (o actualiza la ruta en `setup-local.ps1`)

O actualiza `setup-local.ps1` con la ruta correcta:

```powershell
$env:GOOGLE_SERVICE_ACCOUNT_PATH="C:\ruta\completa\al\archivo-service-account.json"
```

## Verificación

El archivo JSON del Service Account debe tener esta estructura:

```json
{
  "type": "service_account",
  "project_id": "vielcafotos",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "...@vielcafotos.iam.gserviceaccount.com",
  ...
}
```

**Importante**: El archivo actual (`client_secret_*.json`) tiene esta estructura:

```json
{
  "web": {
    "client_id": "...",
    "client_secret": "...",
    ...
  }
}
```

Este formato NO funcionará con el código actual.

## Alternativa: Usar OAuth 2.0 (Más Complejo)

Si prefieres usar OAuth 2.0, necesitarías:
1. Implementar un flujo de autenticación completo
2. Almacenar tokens de acceso/refresh
3. Manejar la renovación de tokens

**Recomendación**: Usa Service Account, es mucho más simple para este caso de uso.

