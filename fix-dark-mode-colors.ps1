# Script para corregir colores de modo oscuro
# Reemplaza text-gris-oscuro sin dark: por text-gris-oscuro dark:text-gray-100

$files = @(
    "src\components\Admin\AdminOrders.tsx",
    "src\components\Admin\AdminProducts.tsx",
    "src\components\Admin\AdminDashboard.tsx",
    "src\components\Admin\AdminUsers.tsx",
    "src\components\Admin\LowStockAlert.tsx",
    "src\components\Admin\SalesChart.tsx",
    "src\components\Admin\TopProducts.tsx",
    "src\components\Admin\ConversionRate.tsx",
    "src\pages\Profile.tsx",
    "src\pages\Home.tsx",
    "src\pages\Admin.tsx",
    "src\components\Auth\ProtectedRoute.tsx",
    "src\components\Layout\Navbar.tsx",
    "src\components\Layout\Footer.tsx",
    "src\components\ErrorBoundary.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Procesando: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        
        # Reemplazos específicos
        $replacements = @{
            'text-gris-oscuro">Gestión' = 'text-gris-oscuro dark:text-gray-100">Gestión'
            'text-gris-oscuro">Admin' = 'text-gris-oscuro dark:text-gray-100">Admin'
            'text-sm font-medium text-gris-oscuro">' = 'text-sm font-medium text-gris-oscuro dark:text-gray-100">'
            'text-sm text-gris-oscuro">' = 'text-sm text-gris-oscuro dark:text-gray-100">'
            'text-lg font-semibold text-gris-oscuro">' = 'text-lg font-semibold text-gris-oscuro dark:text-gray-100">'
            'text-lg font-semibold text-gris-oscuro mb' = 'text-lg font-semibold text-gris-oscuro dark:text-gray-100 mb'
            'text-2xl font-bold text-gris-oscuro">' = 'text-2xl font-bold text-gris-oscuro dark:text-gray-100">'
            'text-2xl font-bold text-gris-oscuro mb' = 'text-2xl font-bold text-gris-oscuro dark:text-gray-100 mb'
            'text-xl font-bold text-gris-oscuro' = 'text-xl font-bold text-gris-oscuro dark:text-gray-100'
            'text-3xl md:text-4xl font-bold text-gris-oscuro">' = 'text-3xl md:text-4xl font-bold text-gris-oscuro dark:text-gray-100">'
            'text-3xl font-bold text-gris-oscuro' = 'text-3xl font-bold text-gris-oscuro dark:text-gray-100'
            'text-4xl font-bold text-gris-oscuro' = 'text-4xl font-bold text-gris-oscuro dark:text-gray-100'
            '<p className="text-gris-oscuro">' = '<p className="text-gris-oscuro dark:text-gray-100">'
            '<p className="text-gris-oscuro capitalize">' = '<p className="text-gris-oscuro dark:text-gray-100 capitalize">'
            'font-semibold text-gris-oscuro">' = 'font-semibold text-gris-oscuro dark:text-gray-100">'
            'font-medium text-gris-oscuro">' = 'font-medium text-gris-oscuro dark:text-gray-100">'
            'text-gris-oscuro truncate">' = 'text-gris-oscuro dark:text-gray-100 truncate">'
            'className="text-center text-gris-oscuro">' = 'className="text-center text-gris-oscuro dark:text-gray-100">'
        }
        
        $modified = $false
        foreach ($key in $replacements.Keys) {
            if ($content -match [regex]::Escape($key)) {
                $content = $content -replace [regex]::Escape($key), $replacements[$key]
                $modified = $true
            }
        }
        
        if ($modified) {
            Set-Content -Path $fullPath -Value $content -NoNewline
            Write-Host "  Modificado OK" -ForegroundColor Green
        } else {
            Write-Host "  Sin cambios" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No encontrado: $file" -ForegroundColor Red
    }
}

Write-Host "Proceso completado" -ForegroundColor Green
