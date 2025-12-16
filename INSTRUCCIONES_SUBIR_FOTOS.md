# Instrucciones para Subir Fotos a Clever Cloud MySQL desde Local

## Método 1: Usando el Script PowerShell (Más Fácil)

1. **Abre PowerShell** en la carpeta del proyecto:
   ```powershell
   cd C:\Users\Equipo1\Desktop\PROYECTOS\VisualizadorFotos
   ```

2. **Ejecuta el script**:
   ```powershell
   .\subir-fotos-local.ps1
   ```

3. **Inicia el servidor**:
   ```powershell
   npm start
   ```

4. **Abre tu navegador** en `http://localhost:3000`

5. **Sube tus fotos** - Se guardarán directamente en MySQL de Clever Cloud

## Método 2: Configurar Variables Manualmente

Si prefieres hacerlo manualmente, ejecuta estos comandos en PowerShell **ANTES** de `npm start`:

```powershell
cd C:\Users\Equipo1\Desktop\PROYECTOS\VisualizadorFotos

# Configurar MySQL de Clever Cloud
$env:DB_HOST="bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com"
$env:DB_PORT="3306"
$env:DB_USER="uht4tll0gf9lyffl"
$env:DB_PASSWORD="5hi8TfIe8tqGsWIxOvIb"
$env:DB_NAME="bgdoaasgoznr2hmdj24v"

# Habilitar subida
$env:ENABLE_UPLOAD="true"

# Puerto del servidor
$env:PORT="3000"

# Ahora inicia el servidor
npm start
```

## Verificar que está conectado a Clever Cloud

Cuando ejecutes `npm start`, deberías ver en la consola:

```
✓ Base de datos MySQL inicializada correctamente
Servidor escuchando en el puerto 3000
```

Si ves:
```
⚠️ Variables de entorno de MySQL no configuradas...
```

Significa que las variables no se configuraron correctamente. Vuelve a ejecutar los comandos de arriba.

## Subir las Fotos

1. Abre `http://localhost:3000` en tu navegador
2. Haz clic en "Seleccionar fotos (PNG/JPG) - Puedes elegir múltiples"
3. Selecciona todas tus fotos (Ctrl+A o selección múltiple)
4. Haz clic en "Subir lote de fotos"
5. Espera a que termine (verás el progreso)
6. Las fotos se guardarán directamente en MySQL de Clever Cloud

## Verificar que se guardaron

Puedes verificar en MySQL de Clever Cloud ejecutando:

```sql
SELECT COUNT(*) as total_fotos FROM photos;
SELECT filename, mime_type, created_at FROM photos ORDER BY created_at DESC LIMIT 10;
```

## Nota Importante

- Las variables de entorno solo duran mientras la ventana de PowerShell esté abierta
- Si cierras PowerShell y vuelves a abrir, necesitas ejecutar los comandos de nuevo
- Las fotos se guardan directamente en MySQL, no en la carpeta `uploads/` local

