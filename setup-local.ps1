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
$env:GOOGLE_DRIVE_FOLDER_ID="TU_ID_DE_CARPETA_AQUI"

# 2. Ruta al archivo JSON de Service Account descargado de Google Cloud
$env:GOOGLE_SERVICE_ACCOUNT_PATH="C:\ruta\al\service-account.json"

# Habilitar subida
$env:ENABLE_UPLOAD="true"

# Puerto del servidor
$env:PORT="3000"

Write-Host "✓ Variables configuradas" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Edita este script y configura:" -ForegroundColor Yellow
Write-Host "   - GOOGLE_DRIVE_FOLDER_ID" -ForegroundColor Yellow
Write-Host "   - GOOGLE_SERVICE_ACCOUNT_PATH" -ForegroundColor Yellow
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

npm start
