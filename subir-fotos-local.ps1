# Script PowerShell para configurar variables de entorno y subir fotos a Clever Cloud MySQL
# Ejecuta este script antes de npm start

# Configurar variables de entorno para MySQL de Clever Cloud
$env:DB_HOST="bgdoaasgoznr2hmdj24v-mysql.services.clever-cloud.com"
$env:DB_PORT="3306"
$env:DB_USER="uht4tll0gf9lyffl"
$env:DB_PASSWORD="5hi8TfIe8tqGsWIxOvIb"
$env:DB_NAME="bgdoaasgoznr2hmdj24v"

# Mantener la subida habilitada
$env:ENABLE_UPLOAD="true"

# Puerto para el servidor local
$env:PORT="3000"

Write-Host "✓ Variables de entorno configuradas para Clever Cloud MySQL" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora ejecuta: npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Luego abre: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Y podrás subir tus fotos directamente a MySQL de Clever Cloud" -ForegroundColor Cyan

