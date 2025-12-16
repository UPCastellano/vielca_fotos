# Script para configurar variables de entorno de MySQL Clever Cloud
# Ejecuta este script antes de npm start

Write-Host "Configurando variables de entorno para Clever Cloud MySQL..." -ForegroundColor Yellow
Write-Host ""

# Configurar variables de entorno para MySQL de Clever Cloud
$env:DB_HOST="bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com"
$env:DB_PORT="3306"
$env:DB_USER="uht4tll0gf9lyffl"
$env:DB_PASSWORD="5hi8TfIe8tqGsWIxOvIb"
$env:DB_NAME="bgdoaasgoznr2hmdj24v"

# Habilitar subida de fotos
$env:ENABLE_UPLOAD="true"

# Puerto del servidor local
$env:PORT="3000"

Write-Host "✓ Variables configuradas correctamente:" -ForegroundColor Green
Write-Host ""
Write-Host "  DB_HOST     = $env:DB_HOST" -ForegroundColor Cyan
Write-Host "  DB_PORT     = $env:DB_PORT" -ForegroundColor Cyan
Write-Host "  DB_USER     = $env:DB_USER" -ForegroundColor Cyan
Write-Host "  DB_NAME     = $env:DB_NAME" -ForegroundColor Cyan
Write-Host "  ENABLE_UPLOAD = $env:ENABLE_UPLOAD" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "Ahora ejecuta: npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Luego abre: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Y podrás subir tus fotos directamente a MySQL de Clever Cloud" -ForegroundColor Cyan
Write-Host ""

