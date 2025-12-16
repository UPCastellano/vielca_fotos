# Script completo: Configura MySQL y inicia el servidor
# Ejecuta este script para todo en uno

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  Configurando Visualizador de Fotos - Vielca" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Configurar variables de entorno para MySQL de Clever Cloud
Write-Host "Configurando MySQL de Clever Cloud..." -ForegroundColor Yellow
$env:DB_HOST="bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com"
$env:DB_PORT="3306"
$env:DB_USER="uht4tll0gf9lyffl"
$env:DB_PASSWORD="5hi8TfIe8tqGsWIxOvIb"
$env:DB_NAME="bgdoaasgoznr2hmdj24v"
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

