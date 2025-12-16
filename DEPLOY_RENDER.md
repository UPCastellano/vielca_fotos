# 🚀 Guía de Despliegue en Render

## Variables de Entorno en Render

### Paso 1: Crear un Nuevo Servicio en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **New +** → **Web Service**
3. Conecta tu repositorio de GitHub/GitLab
4. Selecciona el repositorio `vielca_fotos`

### Paso 2: Configurar el Servicio

**Configuración básica:**
- **Name**: `visualizador-fotos-vielca` (o el nombre que prefieras)
- **Region**: Elige la región más cercana
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### Paso 3: Agregar Variables de Entorno

En la sección **Environment Variables**, agrega las siguientes variables:

#### 1. `GOOGLE_DRIVE_FOLDER_ID`
- **Key**: `GOOGLE_DRIVE_FOLDER_ID`
- **Value**: `1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb`
- **Description**: ID de la carpeta de Google Drive donde están las fotos

#### 2. `GOOGLE_SERVICE_ACCOUNT`
- **Key**: `GOOGLE_SERVICE_ACCOUNT`
- **Value**: (Pega el contenido completo del archivo `credentials/client_secret.json` como una sola línea)
- **Formato**: Debe ser un JSON válido en una sola línea, sin saltos de línea
- **Ejemplo**:
  ```json
  {"web":{"client_id":"62237646464-7d996nrv0s5j6b1mb38q9aj4hmtudacu.apps.googleusercontent.com","project_id":"vielcafotos","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["http://localhost:3000"]}}
  ```

#### 3. `GOOGLE_DRIVE_TOKEN`
- **Key**: `GOOGLE_DRIVE_TOKEN`
- **Value**: (Contenido de `credentials/token.json` como JSON en una línea)

**Para obtener el valor:**
1. Ejecuta localmente: `node auth-google.js`
2. Abre `credentials/token.json`
3. Copia TODO el contenido (debe ser una sola línea JSON)
4. Pégalo como valor de esta variable

**Ejemplo de formato:**
```json
{"access_token":"ya29.a0AfH6SMC...","refresh_token":"1//0g...","scope":"https://www.googleapis.com/auth/drive","token_type":"Bearer","expiry_date":1234567890}
```

#### 4. `ENABLE_UPLOAD` (Opcional)
- **Key**: `ENABLE_UPLOAD`
- **Value**: `false`
- **Description**: Deshabilita la subida de fotos en producción (solo visualización)

#### 5. `PORT` (Opcional - Render lo maneja automáticamente)
- **Key**: `PORT`
- **Value**: (Render lo configura automáticamente, pero puedes dejarlo vacío o poner `10000`)

### Paso 4: Configurar el Servidor para Render

Render asigna un puerto dinámicamente. Asegúrate de que el servidor use `process.env.PORT`:

```javascript
const PORT = process.env.PORT || 3000;
```

(Esto ya está configurado en tu `server.js`)

### Paso 5: Desplegar

1. Haz clic en **Create Web Service**
2. Render comenzará a construir y desplegar tu aplicación
3. Espera a que termine el despliegue (puede tomar 2-5 minutos)
4. Una vez completado, tendrás una URL como: `https://tu-app.onrender.com`

## 📝 Resumen de Variables de Entorno

| Variable | Valor | Requerido | Descripción |
|----------|-------|-----------|-------------|
| `GOOGLE_DRIVE_FOLDER_ID` | `1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb` | ✅ Sí | ID de carpeta de Google Drive |
| `GOOGLE_SERVICE_ACCOUNT` | JSON de credenciales (una línea) | ✅ Sí | Credenciales OAuth 2.0 |
| `GOOGLE_DRIVE_TOKEN` | JSON del token (una línea) | ✅ Sí | Token de acceso OAuth 2.0 |
| `ENABLE_UPLOAD` | `false` | ❌ No | Deshabilitar subida en producción |
| `PORT` | (auto) | ❌ No | Puerto (Render lo maneja) |

## 🔧 Configuración Adicional

### Auto-Deploy
- Render despliega automáticamente cuando haces push a la rama `main`
- Puedes deshabilitarlo en **Settings** → **Auto-Deploy**

### Health Check (Opcional)
- Render puede verificar que tu app esté funcionando
- Agrega un endpoint `/health` si quieres (opcional)

### Custom Domain (Opcional)
- En **Settings** → **Custom Domain** puedes agregar tu propio dominio

## 🐛 Solución de Problemas

### Error: "Google Drive no está configurado"
- Verifica que `GOOGLE_DRIVE_FOLDER_ID` esté configurada
- Verifica que `GOOGLE_SERVICE_ACCOUNT` tenga el formato correcto (JSON en una línea)

### Error: "Token no encontrado"
- Verifica que `GOOGLE_DRIVE_TOKEN` esté configurada
- Asegúrate de que el token sea válido (no haya expirado)
- Si expiró, obtén uno nuevo con `node auth-google.js` y actualiza la variable

### Error: "Unexpected non-whitespace character after JSON"
**Causa:** El JSON en las variables de entorno tiene caracteres inválidos o saltos de línea.

**Solución:**
1. **GOOGLE_SERVICE_ACCOUNT**: Debe ser UNA SOLA LÍNEA, sin saltos de línea, sin espacios al inicio/final
2. **GOOGLE_DRIVE_TOKEN**: Debe ser UNA SOLA LÍNEA, sin saltos de línea, sin espacios al inicio/final
3. Copia el JSON completo desde `credentials/token.json` o `credentials/client_secret.json`
4. Pega directamente en Render sin modificar
5. Asegúrate de que no haya comillas adicionales alrededor del JSON

**Verificar JSON válido en PowerShell:**
```powershell
$json = 'TU_JSON_AQUI'
$json | ConvertFrom-Json
```
Si no da error, el JSON es válido.

### Las fotos no se muestran
- Revisa los logs de Render (en el dashboard, sección **Logs**)
- Verifica que el token sea válido
- Verifica que tengas acceso a la carpeta de Google Drive

### Error de Build
- Verifica que `package.json` tenga todas las dependencias
- Revisa los logs de build en Render

## 🔄 Renovar el Token

Cuando el token OAuth 2.0 expire:

1. Ejecuta localmente: `node auth-google.js`
2. Copia el nuevo token de `credentials/token.json`
3. Ve a Render → Tu Servicio → **Environment**
4. Edita `GOOGLE_DRIVE_TOKEN` con el nuevo valor
5. Guarda los cambios
6. Render reiniciará automáticamente el servicio

## 📚 Recursos

- [Documentación de Render](https://render.com/docs)
- [Variables de Entorno en Render](https://render.com/docs/environment-variables)
- [Google Drive API - OAuth 2.0](https://developers.google.com/drive/api/guides/about-auth)

## ⚠️ Nota Importante sobre el Token

El token OAuth 2.0 expira después de un tiempo. Para producción, considera:

1. **Opción A**: Renovar manualmente cuando expire (como se explica arriba)
2. **Opción B**: Usar Service Account en lugar de OAuth 2.0 (más confiable para producción, no expira)

Si quieres cambiar a Service Account, necesitarías:
- Crear un Service Account en Google Cloud Console
- Descargar el JSON del Service Account
- Usar `GOOGLE_SERVICE_ACCOUNT` con el formato de Service Account en lugar de OAuth 2.0

