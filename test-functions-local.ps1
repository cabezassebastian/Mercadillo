#!/usr/bin/env pwsh
# Script para probar las Edge Functions localmente
# Para ejecutar: .\test-functions-local.ps1

Write-Host "🧪 Iniciando Edge Functions localmente..." -ForegroundColor Cyan
Write-Host ""

# Verificar si existe .env.local
if (!(Test-Path ".\supabase\.env.local")) {
    Write-Host "⚠️  No se encontró supabase/.env.local" -ForegroundColor Yellow
    Write-Host "Creando archivo de ejemplo..." -ForegroundColor Yellow
    
    $envContent = @"
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
ADMIN_SECRET=test_secret_local
"@
    
    New-Item -Path ".\supabase\.env.local" -ItemType File -Value $envContent -Force | Out-Null
    Write-Host "✅ Archivo creado en supabase/.env.local" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edita el archivo y agrega tus keys reales" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "🚀 Iniciando Supabase local..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Las funciones estarán disponibles en:" -ForegroundColor Yellow
Write-Host "  http://localhost:54321/functions/v1/products/{id}" -ForegroundColor Green
Write-Host "  http://localhost:54321/functions/v1/orders" -ForegroundColor Green
Write-Host "  http://localhost:54321/functions/v1/admin?action=stats" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

# Iniciar funciones localmente
supabase functions serve --env-file ./supabase/.env.local
