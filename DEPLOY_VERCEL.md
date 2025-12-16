# 🚀 Guía de Despliegue en Vercel

## Variables de Entorno en Vercel

### Paso 1: Ir a la Configuración de Vercel

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Haz clic en **Settings** (Configuración)
3. Ve a **Environment Variables** (Variables de Entorno)

### Paso 2: Agregar las Variables de Entorno

Agrega las siguientes variables:

#### 1. `GOOGLE_DRIVE_FOLDER_ID`
- **Valor**: `1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb`
- **Descripción**: ID de la carpeta de Google Drive donde están las fotos
- **Entornos**: Production, Preview, Development (todos)

#### 2. `GOOGLE_SERVICE_ACCOUNT`
- **Valor**: (Pega el contenido completo del archivo `credentials/client_secret.json` como una sola línea)
- **Formato**: Debe ser un JSON válido en una sola línea, sin saltos de línea
- **Ejemplo**:
  ```json
  {"web":{"client_id":"62237646464-7d996nrv0s5j6b1mb38q9aj4hmtudacu.apps.googleusercontent.com","project_id":"vielcafotos","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["http://localhost:3000"]}}
  ```
- **Descripción**: Credenciales OAuth 2.0 de Google Drive
- **Entornos**: Production, Preview, Development (todos)

#### 3. `ENABLE_UPLOAD` (Opcional)
- **Valor**: `false` (para producción, solo visualización)
- **Descripción**: Controla si se permite subir fotos
- **Entornos**: Production (opcional en Preview/Development)

#### 4. `PORT` (Opcional)
- **Valor**: `3000` (Vercel lo maneja automáticamente, pero puedes dejarlo)
- **Descripción**: Puerto del servidor
- **Entornos**: No necesario en Vercel

### Paso 3: Obtener el Token OAuth 2.0 para Producción

**IMPORTANTE**: En Vercel necesitarás un token OAuth 2.0 válido. Tienes dos opciones:

#### Opción A: Usar el token local (más fácil)

1. Ejecuta localmente: `node auth-google.js`
2. Copia el contenido de `credentials/token.json`
3. Agrega una variable de entorno `GOOGLE_DRIVE_TOKEN` con ese contenido (como JSON en una línea)

#### Opción B: Modificar el código para obtener token automáticamente (recomendado)

El código actual intenta cargar el token desde archivo. Para Vercel, necesitamos agregar soporte para token desde variable de entorno.

**Nota**: El código actual ya intenta cargar desde archivo. Para producción, sería mejor usar Service Account, pero como ya tienes OAuth 2.0 configurado, podemos agregar soporte para token desde variable de entorno.

### Paso 4: Configurar el Token (si usas Opción A)

Agrega esta variable adicional:

#### `GOOGLE_DRIVE_TOKEN` (Opcional, si usas token desde variable)
- **Valor**: Contenido de `credentials/token.json` como JSON en una línea
- **Formato**: `{"access_token":"...","refresh_token":"...","scope":"...","token_type":"Bearer","expiry_date":...}`
- **Entornos**: Production, Preview, Development

## ⚠️ Importante: Token OAuth 2.0 en Vercel

El problema es que OAuth 2.0 requiere un token que se obtiene interactivamente. Para producción, hay dos soluciones:

### Solución 1: Usar el token local (temporal)
1. Obtén el token localmente con `node auth-google.js`
2. Copia el contenido de `credentials/token.json`
3. Agrégala como variable de entorno `GOOGLE_DRIVE_TOKEN`
4. **Nota**: El token expira, necesitarás renovarlo periódicamente

### Solución 2: Modificar código para usar Service Account (recomendado para producción)
Para producción, es mejor usar Service Account en lugar de OAuth 2.0 porque:
- No requiere interacción del usuario
- No expira como los tokens OAuth
- Más confiable para aplicaciones de servidor

## 📝 Resumen de Variables de Entorno

| Variable | Valor | Requerido | Entornos |
|----------|-------|-----------|----------|
| `GOOGLE_DRIVE_FOLDER_ID` | `1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb` | ✅ Sí | Todos |
| `GOOGLE_SERVICE_ACCOUNT` | JSON de credenciales (una línea) | ✅ Sí | Todos |
| `GOOGLE_DRIVE_TOKEN` | JSON del token (una línea) | ⚠️ Si usas OAuth2 | Todos |
| `ENABLE_UPLOAD` | `false` | ❌ No | Production |

## 🔧 Pasos para Desplegar

1. **Sube los cambios a Git:**
   ```bash
   git add .
   git commit -m "Preparado para despliegue en Vercel"
   git push
   ```

2. **En Vercel:**
   - Conecta tu repositorio (si no está conectado)
   - Vercel detectará automáticamente los cambios
   - Agrega las variables de entorno antes del primer despliegue

3. **Despliega:**
   - Vercel desplegará automáticamente
   - O haz clic en "Redeploy" después de agregar las variables

## 🐛 Solución de Problemas

### Error: "Google Drive no está configurado"
- Verifica que `GOOGLE_DRIVE_FOLDER_ID` esté configurada
- Verifica que `GOOGLE_SERVICE_ACCOUNT` tenga el formato correcto (JSON en una línea)

### Error: "Token no encontrado"
- Si usas OAuth 2.0, agrega `GOOGLE_DRIVE_TOKEN`
- O considera cambiar a Service Account para producción

### Las fotos no se muestran
- Verifica los logs de Vercel (Functions → Logs)
- Verifica que el token sea válido
- Verifica que tengas acceso a la carpeta de Google Drive

## 📚 Recursos

- [Documentación de Vercel - Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Drive API - OAuth 2.0](https://developers.google.com/drive/api/guides/about-auth)

