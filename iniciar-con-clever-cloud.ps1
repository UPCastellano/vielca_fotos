# Script completo: Configura Clever Cloud MySQL y inicia el servidor
# Ejecuta este script para todo en uno

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  Visualizador de Fotos - Vielca Ingenieros" -ForegroundColor White
Write-Host "  Conectando a Clever Cloud MySQL" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Variables de entorno de Clever Cloud MySQL
Write-Host "Configurando MySQL de Clever Cloud..." -ForegroundColor Yellow
$env:MYSQL_ADDON_HOST="b3nk42c7ffxjml0xmqrv-mysql.services.clever-cloud.com"
$env:MYSQL_ADDON_PORT="3306"
$env:MYSQL_ADDON_USER="umnkr3fewyhygios"
$env:MYSQL_ADDON_PASSWORD="bTeExcydXtflZIFBKpmC"
$env:MYSQL_ADDON_DB="b3nk42c7ffxjml0xmqrv"
$env:ENABLE_UPLOAD="true"
$env:PORT="3000"

Write-Host "✓ Variables configuradas" -ForegroundColor Green
Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Iniciar el servidor
npm start

