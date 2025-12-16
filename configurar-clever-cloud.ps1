# Script para configurar variables de entorno de Clever Cloud MySQL
# Ejecuta este script antes de npm start

Write-Host "Configurando variables de entorno para Clever Cloud MySQL..." -ForegroundColor Yellow
Write-Host ""

# Variables de entorno de Clever Cloud MySQL (nueva base de datos)
$env:MYSQL_ADDON_HOST="b3nk42c7ffxjml0xmqrv-mysql.services.clever-cloud.com"
$env:MYSQL_ADDON_PORT="3306"
$env:MYSQL_ADDON_USER="umnkr3fewyhygios"
$env:MYSQL_ADDON_PASSWORD="bTeExcydXtflZIFBKpmC"
$env:MYSQL_ADDON_DB="b3nk42c7ffxjml0xmqrv"

# Habilitar subida de fotos
$env:ENABLE_UPLOAD="true"

# Puerto del servidor local
$env:PORT="3000"

Write-Host "✓ Variables configuradas correctamente:" -ForegroundColor Green
Write-Host ""
Write-Host "  MYSQL_ADDON_HOST     = $env:MYSQL_ADDON_HOST" -ForegroundColor Cyan
Write-Host "  MYSQL_ADDON_PORT     = $env:MYSQL_ADDON_PORT" -ForegroundColor Cyan
Write-Host "  MYSQL_ADDON_USER     = $env:MYSQL_ADDON_USER" -ForegroundColor Cyan
Write-Host "  MYSQL_ADDON_DB       = $env:MYSQL_ADDON_DB" -ForegroundColor Cyan
Write-Host "  ENABLE_UPLOAD        = $env:ENABLE_UPLOAD" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "Ahora ejecuta: npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Luego abre: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Y podrás subir tus fotos directamente a MySQL de Clever Cloud" -ForegroundColor Cyan
Write-Host ""

