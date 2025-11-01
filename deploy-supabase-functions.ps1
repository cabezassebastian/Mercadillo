#!/usr/bin/env pwsh
# Script de deployment para Supabase Edge Functions
# Para ejecutar: .\deploy-supabase-functions.ps1

Write-Host "🚀 Desplegando Supabase Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Supabase CLI está instalado
try {
    $version = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Supabase CLI no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalar con: npm install -g supabase" -ForegroundColor Yellow
    Write-Host "O con Scoop: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Funciones a desplegar:" -ForegroundColor Yellow
Write-Host "  1. products  (Detalles de productos)"
Write-Host "  2. orders    (Gestión de pedidos)"
Write-Host "  3. admin     (Panel administrativo)"
Write-Host ""

# Confirmar deployment
$confirm = Read-Host "¿Desplegar todas las funciones? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Deployment cancelado" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔐 Verificando autenticación..." -ForegroundColor Cyan

# Verificar si está logueado
try {
    supabase projects list 2>&1 | Out-Null
    Write-Host "✅ Autenticado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ No estás autenticado. Ejecuta: supabase login" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔗 Verificando link del proyecto..." -ForegroundColor Cyan

# Link al proyecto si no está linkeado
if (!(Test-Path ".\.supabase\config.toml")) {
    Write-Host "⚠️  Proyecto no linkeado. Linkeando..." -ForegroundColor Yellow
    supabase link --project-ref xwubnuokmfghtyyfpgtl
} else {
    Write-Host "✅ Proyecto ya está linkeado" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Desplegando funciones..." -ForegroundColor Cyan
Write-Host ""

# Desplegar cada función
$functions = @("products", "orders", "admin")
$deployed = 0
$failed = 0

foreach ($func in $functions) {
    Write-Host "  Desplegando $func..." -ForegroundColor Yellow
    try {
        supabase functions deploy $func --no-verify-jwt
        Write-Host "  ✅ $func desplegada exitosamente" -ForegroundColor Green
        $deployed++
    } catch {
        Write-Host "  ❌ Error desplegando $func" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen del Deployment:" -ForegroundColor Cyan
Write-Host "  ✅ Funciones desplegadas: $deployed" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "  ❌ Funciones fallidas: $failed" -ForegroundColor Red
}
Write-Host ""

if ($deployed -eq $functions.Count) {
    Write-Host "🎉 ¡Deployment completado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 URLs de las funciones:" -ForegroundColor Yellow
    Write-Host "  products: https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/{id}"
    Write-Host "  orders:   https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/orders"
    Write-Host "  admin:    https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/admin?action=..."
    Write-Host ""
    Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Configurar secrets (ver supabase/SETUP-SECRETS.md)"
    Write-Host "  2. Probar las funciones en el dashboard de Supabase"
    Write-Host "  3. Actualizar el frontend para usar las nuevas URLs"
    Write-Host "  4. Verificar en producción"
    Write-Host ""
} else {
    Write-Host "⚠️  Deployment completado con errores" -ForegroundColor Yellow
    Write-Host "Revisa los logs arriba para más detalles" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
