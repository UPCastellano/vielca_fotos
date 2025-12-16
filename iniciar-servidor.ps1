# Script mejorado para iniciar el servidor con verificación
# Verifica que todo esté configurado antes de iniciar

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  Visualizador de Fotos - Vielca Ingenieros 10 Años" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Verificar credenciales
Write-Host "Verificando configuración..." -ForegroundColor Yellow

if (-not (Test-Path "credentials\client_secret.json")) {
    Write-Host "❌ Error: No se encontró credentials\client_secret.json" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "credentials\token.json")) {
    Write-Host "⚠️  No se encontró token.json" -ForegroundColor Yellow
    Write-Host "   Ejecutando autenticación..." -ForegroundColor Yellow
    node auth-google.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en la autenticación" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Credenciales encontradas" -ForegroundColor Green

# Configurar variables de entorno
$env:GOOGLE_DRIVE_FOLDER_ID="1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb"
$env:GOOGLE_SERVICE_ACCOUNT_PATH="credentials\client_secret.json"
$env:ENABLE_UPLOAD="true"
$env:PORT="3000"

Write-Host "✓ Variables de entorno configuradas" -ForegroundColor Green
Write-Host ""
Write-Host "ID de carpeta: $env:GOOGLE_DRIVE_FOLDER_ID" -ForegroundColor Cyan
Write-Host ""

# Verificar que el puerto 3000 esté libre
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  El puerto 3000 está en uso" -ForegroundColor Yellow
    Write-Host "   Deteniendo procesos en el puerto 3000..." -ForegroundColor Yellow
    $process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "  Iniciando servidor..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Servidor iniciado en: http://localhost:3000" -ForegroundColor Green
Write-Host "  Abre esta URL en tu navegador para ver las fotos" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Gray
Write-Host ""

# Iniciar servidor
npm start

