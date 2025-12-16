# Script para configurar y ejecutar el servidor local
# Conecta a Google Drive

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  Visualizador de Fotos - Vielca Ingenieros 10 Años" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Variables de entorno de Google Drive
Write-Host "Configurando Google Drive..." -ForegroundColor Yellow

# IMPORTANTE: Configura estos valores antes de ejecutar
# 1. ID de la carpeta de Google Drive (obtener de la URL de la carpeta)
$env:GOOGLE_DRIVE_FOLDER_ID="1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb"

# 2. Ruta al archivo JSON de Service Account descargado de Google Cloud
# Si no se especifica, intentará usar credentials/client_secret.json
$env:GOOGLE_SERVICE_ACCOUNT_PATH="credentials\client_secret.json"

# Habilitar subida
$env:ENABLE_UPLOAD="true"

# Puerto del servidor
$env:PORT="3000"

Write-Host "✓ Variables configuradas" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Si es la primera vez, ejecuta:" -ForegroundColor Yellow
Write-Host "   node auth-google.js" -ForegroundColor Cyan
Write-Host "   para obtener el token de acceso OAuth 2.0" -ForegroundColor Yellow
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

npm start
