# 🔧 Solución: Error de Parseo JSON en Render

## ❌ Error
```
Error: Unexpected non-whitespace character after JSON at position 390
```

## 🔍 Causa
El JSON en las variables de entorno de Render tiene caracteres inválidos o saltos de línea.

## ✅ Solución

### Paso 1: Verificar GOOGLE_SERVICE_ACCOUNT

En Render → Tu Servicio → Environment Variables:

1. **Edita** `GOOGLE_SERVICE_ACCOUNT`
2. **Copia este valor exacto** (debe ser UNA SOLA LÍNEA, sin saltos):

```json
{"web":{"client_id":"62237646464-7d996nrv0s5j6b1mb38q9aj4hmtudacu.apps.googleusercontent.com","project_id":"vielcafotos","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["http://localhost:3000"]}}
```

**IMPORTANTE:**
- ✅ Debe ser UNA SOLA LÍNEA
- ✅ Sin saltos de línea
- ✅ Sin espacios al inicio o final
- ✅ Sin comillas adicionales

### Paso 2: Verificar GOOGLE_DRIVE_TOKEN

1. **Ejecuta localmente:**
   ```powershell
   node auth-google.js
   ```

2. **Abre el archivo:** `credentials/token.json`

3. **Copia TODO el contenido** (debe ser JSON en una línea)

4. **En Render**, edita `GOOGLE_DRIVE_TOKEN` y pega el valor

**Formato correcto:**
```json
{"access_token":"ya29.a0Aa7pCA...","refresh_token":"1//05TzKe0Ad1yR6CgYIARAAGAUSNwF-L9IrNbfGNJVfJoVobP20OccdKRq4mHurCpH7Sw-zdV0OtqwG7p43f18V4Tkr7hKLlaLV2lM","scope":"https://www.googleapis.com/auth/drive","token_type":"Bearer","refresh_token_expires_in":604799,"expiry_date":1765916098621}
```

**IMPORTANTE:**
- ✅ Debe ser UNA SOLA LÍNEA
- ✅ Sin saltos de línea
- ✅ Sin espacios al inicio o final
- ✅ Sin comillas adicionales

### Paso 3: Verificar GOOGLE_DRIVE_FOLDER_ID

Debe ser exactamente:
```
1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb
```

Sin espacios, sin comillas.

### Paso 4: Guardar y Reiniciar

1. **Guarda** todas las variables de entorno
2. **Render reiniciará automáticamente** el servicio
3. **Espera** a que termine el despliegue
4. **Revisa los logs** para verificar que no haya errores

## 🧪 Verificar que el JSON es Válido

Puedes probar el JSON antes de pegarlo en Render usando este comando en PowerShell:

```powershell
$json = '{"web":{"client_id":"62237646464-7d996nrv0s5j6b1mb38q9aj4hmtudacu.apps.googleusercontent.com","project_id":"vielcafotos","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["http://localhost:3000"]}}'
$json | ConvertFrom-Json
```

Si no da error, el JSON es válido.

## 📝 Resumen de Variables

| Variable | Valor | Formato |
|----------|-------|---------|
| `GOOGLE_DRIVE_FOLDER_ID` | `1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb` | Texto simple |
| `GOOGLE_SERVICE_ACCOUNT` | JSON en una línea | Sin saltos de línea |
| `GOOGLE_DRIVE_TOKEN` | JSON en una línea | Sin saltos de línea |

## ⚠️ Errores Comunes

1. **Saltos de línea en el JSON**
   - ❌ Mal: JSON con múltiples líneas
   - ✅ Bien: JSON en una sola línea

2. **Espacios al inicio/final**
   - ❌ Mal: ` "{"web":...} "`
   - ✅ Bien: `{"web":...}`

3. **Comillas adicionales**
   - ❌ Mal: `"{"web":...}"`
   - ✅ Bien: `{"web":...}`

4. **Caracteres especiales**
   - Asegúrate de copiar el JSON completo sin modificar

## 🔄 Después de Corregir

Una vez que corrijas las variables, Render debería mostrar en los logs:

```
✓ Credenciales cargadas desde variable de entorno
✓ Credenciales OAuth 2.0 detectadas
✓ Token OAuth 2.0 cargado desde variable de entorno
✓ Google Drive configurado correctamente
✓ Carpeta ID: 1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb
```

Si aún ves el error, verifica que el JSON sea válido usando el comando de prueba arriba.

