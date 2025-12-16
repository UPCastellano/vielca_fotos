# 🔑 Cómo Obtener el Token para Render

## Paso 1: Obtener el Token

Ejecuta este comando en PowerShell:

```powershell
node auth-google.js
```

Este script:
1. Abrirá tu navegador automáticamente
2. Te pedirá autorizar el acceso a Google Drive
3. Capturará el código automáticamente
4. Guardará el token en `credentials/token.json`

## Paso 2: Extraer el Token

Una vez que tengas el token, ejecuta:

```powershell
node extraer-token.js
```

Este script mostrará:
- El token en formato de una sola línea (listo para copiar)
- Información sobre el token (cuándo expira, etc.)
- Guardará el token en `token-para-render.txt` para fácil acceso

## Paso 3: Copiar el Token para Render

1. Abre el archivo `token-para-render.txt`
2. Copia TODO el contenido (debe ser un JSON en una sola línea)
3. Ve a Render → Tu Servicio → Environment Variables
4. Agrega o edita la variable `GOOGLE_DRIVE_TOKEN`
5. Pega el contenido completo
6. Guarda los cambios

## ⚠️ Importante

- El token expira después de un tiempo
- Cuando expire, repite los pasos 1-3 para obtener uno nuevo
- El token tiene un `refresh_token` que permite renovarlo automáticamente
- El servidor intentará renovar el token automáticamente cuando sea necesario

## 🔄 Si el Token Expira

Si el token expira en producción:

1. Ejecuta `node auth-google.js` localmente
2. Ejecuta `node extraer-token.js` para obtener el nuevo token
3. Actualiza `GOOGLE_DRIVE_TOKEN` en Render
4. Render reiniciará automáticamente el servicio

