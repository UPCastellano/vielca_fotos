# 🔐 Instrucciones: Configurar OAuth 2.0 para Google Drive

## ✅ Cambios Realizados

He adaptado tu aplicación para que funcione con las credenciales OAuth 2.0 que ya tienes. Ya no necesitas crear un Service Account.

## 📋 Pasos para Configurar

### Paso 1: Instalar Dependencias

```powershell
npm install
```

### Paso 2: Obtener Token de Acceso (Solo una vez)

Ejecuta el script de autenticación:

```powershell
node auth-google.js
```

Este script:
1. Te mostrará una URL en el navegador
2. Deberás hacer clic en "Permitir" para dar acceso a Google Drive
3. Copiarás el código de autorización que aparece
4. Lo pegarás en la consola
5. El token se guardará automáticamente en `credentials/token.json`

**Nota:** Este proceso solo necesitas hacerlo una vez. El token se renovará automáticamente cuando sea necesario.

### Paso 3: Configurar Variables de Entorno

El archivo `setup-local.ps1` ya está configurado con:
- ✅ ID de carpeta: `1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb`
- ✅ Ruta de credenciales: `credentials\client_secret.json`

### Paso 4: Ejecutar la Aplicación

```powershell
.\setup-local.ps1
```

O manualmente:

```powershell
$env:GOOGLE_DRIVE_FOLDER_ID="1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb"
$env:GOOGLE_SERVICE_ACCOUNT_PATH="credentials\client_secret.json"
npm start
```

## 🔄 Renovación del Token

El token OAuth 2.0 expira después de un tiempo. El servidor intentará renovarlo automáticamente. Si falla, simplemente ejecuta:

```powershell
node auth-google.js
```

## 📁 Estructura de Archivos

```
VisualizadorFotos/
├── credentials/
│   ├── client_secret.json    ← Tus credenciales OAuth 2.0 (ya está)
│   └── token.json            ← Token de acceso (se crea con auth-google.js)
├── auth-google.js            ← Script de autenticación
├── server.js                  ← Servidor (actualizado para OAuth 2.0)
└── setup-local.ps1            ← Script de configuración
```

## ⚠️ Importante

- El archivo `token.json` contiene información sensible. **NO lo subas a Git** (ya está en `.gitignore`)
- La carpeta de Google Drive debe estar accesible con tu cuenta de Google
- Si cambias de cuenta de Google, necesitarás ejecutar `auth-google.js` nuevamente

## 🎯 Verificación

Una vez configurado, deberías ver en la consola:

```
✓ Credenciales OAuth 2.0 detectadas
✓ Token OAuth 2.0 cargado desde archivo
✓ Google Drive configurado correctamente
✓ Carpeta ID: 1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb
```

## 🐛 Solución de Problemas

### Error: "No se encontró token OAuth 2.0"
**Solución:** Ejecuta `node auth-google.js`

### Error: "Token expirado"
**Solución:** El servidor intentará renovarlo automáticamente. Si falla, ejecuta `node auth-google.js`

### Error: "No tienes acceso a la carpeta"
**Solución:** Asegúrate de que la carpeta esté compartida con tu cuenta de Google o que sea pública

