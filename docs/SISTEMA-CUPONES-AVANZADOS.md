# 🎟️ Sistema de Cupones Avanzados - Mercadillo

> Documentación completa de la implementación del sistema de cupones avanzados  
> **Fecha:** 5 de noviembre de 2025  
> **Versión:** 1.0.0

---

## 📋 Tabla de Contenidos

1. [Resumen de Funcionalidades](#resumen-de-funcionalidades)
2. [Migración de Base de Datos](#migración-de-base-de-datos)
3. [Nuevas Funcionalidades](#nuevas-funcionalidades)
4. [Uso del Sistema](#uso-del-sistema)
5. [Próximos Pasos](#próximos-pasos)

---

## ✅ Resumen de Funcionalidades

### Características Implementadas

#### 1. **Cupones por Categoría Específica** ✅
- Cupones que solo aplican a una categoría de productos
- Selector de categoría en formulario de admin
- Validación automática usando función SQL `cupon_aplica_categoria()`
- Badge visual en la tabla mostrando la categoría

#### 2. **Cupones de Primera Compra** ✅
- Checkbox `only_first_purchase` en formulario
- Función SQL `es_primera_compra()` para validación
- Badge "1ª Compra" en UI de admin
- Validación automática en checkout

#### 3. **Estadísticas de Uso** ✅
- Columna `veces_usado` - contador automático
- Columna `total_descuento_aplicado` - acumulado de descuentos
- Vista SQL `cupones_estadisticas` con métricas completas
- Mostrado en tabla de admin con emoji 💰

#### 4. **Sistema de Referidos** ✅
- Tabla `codigos_referidos` con códigos únicos
- Función `generate_referral_code()` para generar códigos
- Función `obtener_codigo_referido()` para obtener/crear código
- Tracking de `referidos_total` por usuario
- Cupones de referido con campo `referred_by`

#### 5. **Tipos Especiales de Cupones** ✅
- **Cumpleaños** (`es_cumpleanos`): Badge 🎂
- **Carrito Abandonado** (`es_carrito_abandonado`): Badge 🛒
- **Referido** (`tipo_cupon='referido'`)
- **Primera Compra** (`tipo_cupon='primera_compra'`)
- **General** (por defecto)

#### 6. **Historial de Uso** ✅
- Tabla `cupones_usados_historial` para tracking detallado
- Trigger automático que actualiza estadísticas
- RLS policies para privacidad de datos

---

## 🗄️ Migración de Base de Datos

### Archivo: `sql-migrations/add-advanced-coupons.sql`

**Ejecutar en Supabase SQL Editor:**

```sql
-- Agregar nuevas columnas a tabla cupones
ALTER TABLE cupones 
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS only_first_purchase BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS veces_usado INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_descuento_aplicado DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tipo_cupon TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS es_cumpleanos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS es_carrito_abandonado BOOLEAN DEFAULT FALSE;
```

### Tablas Creadas

1. **codigos_referidos**
   - `id` (UUID)
   - `usuario_id` (TEXT) - unique
   - `codigo_referido` (TEXT) - unique
   - `referidos_total` (INTEGER)
   - `created_at`, `updated_at`

2. **cupones_usados_historial**
   - `id` (UUID)
   - `cupon_id` (UUID)
   - `pedido_id` (UUID)
   - `usuario_id` (TEXT)
   - `descuento_aplicado` (DECIMAL)
   - `created_at`

### Funciones SQL Creadas

| Función | Descripción |
|---------|-------------|
| `generate_referral_code(user_id)` | Genera código único de referido |
| `obtener_codigo_referido(user_id)` | Obtiene o crea código de referido |
| `cupon_aplica_categoria(cupon_id, categoria)` | Valida si cupón aplica a categoría |
| `es_primera_compra(user_id)` | Verifica si es primera compra |
| `actualizar_estadisticas_cupon()` | Trigger para actualizar stats |

### Vista SQL

**cupones_estadisticas** - Vista consolidada con:
- Estado actual (Activo, Expirado, Agotado, Programado)
- Porcentaje de uso
- Total descuento aplicado
- Veces usado

---

## 🎨 Nuevas Funcionalidades

### Admin - Gestión de Cupones Mejorada

#### Formulario Actualizado

**Nuevos campos:**

1. **Tipo de Cupón** (Select)
   - General
   - Primera Compra
   - Cumpleaños
   - Carrito Abandonado
   - Referido

2. **Categoría Específica** (Select)
   - Todas las categorías (por defecto)
   - Decoración
   - Ropa
   - Accesorios
   - Hogar
   - Electrónica
   - Deportes
   - Juguetes
   - Libros

3. **Checkboxes Especiales:**
   - ☑️ Solo primera compra
   - ☑️ Cupón de cumpleaños
   - ☑️ Recuperar carrito abandonado

#### Tabla Mejorada

**Badges Visuales:**
- 🟣 "1ª Compra" - Primera compra
- 🎂 "Cumple" - Cumpleaños
- 🛒 "Retorno" - Carrito abandonado
- 🔵 Nombre de categoría (si aplica)

**Estadísticas en Celda de Usos:**
- Usos actuales / máximos
- 👥 Usuarios únicos
- 💰 Total descuento aplicado (en soles)

---

## 📖 Uso del Sistema

### Para Administradores

#### Crear Cupón de Primera Compra

```typescript
// En AdminCoupons, crear cupón con:
- Código: BIENVENIDO10
- Tipo: Porcentaje
- Valor: 10
- Tipo de Cupón: Primera Compra
- ☑️ Solo primera compra: TRUE
```

#### Crear Cupón por Categoría

```typescript
// Ejemplo: 20% descuento en Ropa
- Código: ROPA20
- Tipo: Porcentaje
- Valor: 20
- Categoría Específica: Ropa
```

#### Crear Cupón de Cumpleaños

```typescript
// Cupón automático generado por sistema
- Código: CUMPLE2024-USER123
- Tipo: Monto Fijo
- Valor: 50
- ☑️ Cupón de cumpleaños: TRUE
- Usos Máximos: 1
- Fecha Expiración: +7 días desde creación
```

### Para Usuarios

#### Obtener Código de Referido

```typescript
import { obtenerCodigoReferido } from '@/lib/cupones'

const miCodigo = await obtenerCodigoReferido(userId)
// Retorna algo como: "REF4A8B9C"
```

#### Usar Código de Referido

1. Usuario nuevo se registra
2. Ingresa código de referido: `REF4A8B9C`
3. Sistema crea cupón automático de 15% descuento
4. Cupón válido por 30 días
5. Solo para primera compra

#### Validar Cupón en Checkout

```typescript
import { validarCupon, cuponAplicaCategoria, esPrimeraCompra } from '@/lib/cupones'

// Validación básica
const resultado = await validarCupon(codigo, usuarioId, subtotal)

// Validar si aplica a categoría
const aplica = await cuponAplicaCategoria(cuponId, 'Ropa')

// Verificar si es primera compra
const esPrimera = await esPrimeraCompra(usuarioId)
```

#### Registrar Uso de Cupón

```typescript
import { registrarUsoCuponHistorial } from '@/lib/cupones'

// Después de crear pedido exitosamente
await registrarUsoCuponHistorial(
  cuponId,
  pedidoId,
  usuarioId,
  descuentoAplicado
)
// Esto automáticamente actualiza veces_usado y total_descuento_aplicado
```

---

## 🚀 Próximos Pasos

### Tareas Pendientes

#### 1. **Función de Cupones de Cumpleaños** ⏳
**Estimación:** 4 horas

Crear Supabase Edge Function que se ejecute diariamente:

```typescript
// supabase/functions/birthday-coupons/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(...)
  
  // 1. Obtener usuarios con cumpleaños hoy
  const { data: users } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('birthday_month', currentMonth)
    .eq('birthday_day', currentDay)
  
  // 2. Para cada usuario, crear cupón de cumpleaños
  for (const user of users) {
    await supabase.from('cupones').insert({
      codigo: `CUMPLE2024-${user.id.substring(0, 8)}`,
      tipo: 'monto_fijo',
      valor: 50,
      descripcion: '¡Feliz cumpleaños! Regalo especial de Mercadillo',
      es_cumpleanos: true,
      usos_maximos: 1,
      fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      activo: true
    })
    
    // 3. Enviar email con cupón
    await sendBirthdayEmail(user.email, codigo)
  }
  
  return new Response(JSON.stringify({ success: true }))
})
```

**Configurar Cron Job en Supabase:**
```sql
SELECT cron.schedule(
  'birthday-coupons-daily',
  '0 0 * * *', -- Diariamente a medianoche
  $$
  SELECT net.http_post(
    url:='https://[project-ref].supabase.co/functions/v1/birthday-coupons',
    headers:='{"Authorization": "Bearer [anon-key]"}'::jsonb
  ) AS request_id;
  $$
);
```

#### 2. **Página de Referidos para Usuario** ⏳
**Estimación:** 3 horas

Crear componente `src/pages/ReferralPage.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { obtenerCodigoReferido } from '@/lib/cupones'

export default function ReferralPage() {
  const { user } = useUser()
  const [codigoReferido, setCodigoReferido] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  
  useEffect(() => {
    if (user) {
      obtenerCodigoReferido(user.id).then(setCodigoReferido)
    }
  }, [user])
  
  const referralLink = `https://mercadillo.app?ref=${codigoReferido}`
  
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>🎁 Invita a tus amigos</h1>
      <p>Comparte tu código y ambos obtienen descuento</p>
      
      <div className="card mt-6 p-8 text-center">
        <div className="text-6xl font-bold text-amarillo">
          {codigoReferido}
        </div>
        <button onClick={copyLink} className="btn-primary mt-4">
          {copiedLink ? '✅ Copiado!' : '📋 Copiar Link'}
        </button>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-3xl">15%</p>
          <p className="text-sm text-gray-600">Para tu amigo</p>
        </div>
        <div className="card p-4">
          <p className="text-3xl">10%</p>
          <p className="text-sm text-gray-600">Para ti</p>
        </div>
      </div>
    </div>
  )
}
```

#### 3. **Validación Avanzada en Checkout** ⏳
**Estimación:** 3 horas

Actualizar `src/pages/Checkout.tsx` para validar:

```typescript
// Al aplicar cupón, validar:
1. Categoría (si el cupón tiene categoría específica)
2. Primera compra (si only_first_purchase = true)
3. Fecha de expiración
4. Usos máximos
5. Monto mínimo

// Ejemplo de validación completa:
const validarCuponAvanzado = async (
  codigo: string,
  usuarioId: string,
  subtotal: number,
  productosEnCarrito: CartItem[]
) => {
  // 1. Validación básica
  const resultado = await validarCupon(codigo, usuarioId, subtotal)
  if (!resultado.valido) return resultado
  
  // 2. Obtener cupon_id desde resultado
  const cuponId = resultado.cupon_id
  
  // 3. Verificar categoría si aplica
  for (const item of productosEnCarrito) {
    const productoData = await obtenerProducto(item.producto_id)
    const aplica = await cuponAplicaCategoria(cuponId, productoData.categoria)
    if (!aplica) {
      return {
        valido: false,
        mensaje: `Este cupón solo aplica a productos de ${cupón.categoria}`
      }
    }
  }
  
  // 4. Verificar primera compra si aplica
  if (cupon.only_first_purchase) {
    const esPrimera = await esPrimeraCompra(usuarioId)
    if (!esPrimera) {
      return {
        valido: false,
        mensaje: 'Este cupón solo es válido para tu primera compra'
      }
    }
  }
  
  return resultado
}
```

#### 4. **Dashboard de Estadísticas de Cupones** ⏳
**Estimación:** 4 horas

Agregar sección en AdminDashboard con gráfica de uso:

```tsx
// Usar recharts para gráfica de barras
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const CouponStatsChart = () => {
  const [stats, setStats] = useState([])
  
  useEffect(() => {
    obtenerEstadisticasCupones().then(setStats)
  }, [])
  
  return (
    <div className="card p-6">
      <h3>Cupones Más Usados</h3>
      <BarChart data={stats} width={600} height={300}>
        <XAxis dataKey="codigo" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="veces_usado" fill="#FFD700" />
      </BarChart>
    </div>
  )
}
```

---

## 📊 Métricas de Éxito

### KPIs a Medir

| Métrica | Objetivo | Cómo Medirlo |
|---------|----------|--------------|
| **Tasa de conversión con cupones** | >30% | % de pedidos con cupón aplicado |
| **Usuarios referidos** | 50+/mes | Total de códigos de referido usados |
| **Descuento promedio** | S/20-30 | Media de `total_descuento_aplicado` |
| **Cupones de primera compra usados** | >40% | % de nuevos usuarios que usan cupón |
| **Tasa de uso de cupones de cumpleaños** | >60% | Cupones cumpleaños usados vs creados |

### Consultas SQL Útiles

```sql
-- Top 10 cupones más usados
SELECT codigo, veces_usado, total_descuento_aplicado
FROM cupones
ORDER BY veces_usado DESC
LIMIT 10;

-- Usuarios con más referidos
SELECT usuario_id, codigo_referido, referidos_total
FROM codigos_referidos
ORDER BY referidos_total DESC
LIMIT 10;

-- Total descuento otorgado por tipo de cupón
SELECT tipo_cupon, 
       COUNT(*) as total_cupones,
       SUM(veces_usado) as usos_totales,
       SUM(total_descuento_aplicado) as descuento_total
FROM cupones
GROUP BY tipo_cupon;

-- Cupones próximos a expirar (próximos 7 días)
SELECT codigo, fecha_expiracion, veces_usado, usos_maximos
FROM cupones
WHERE fecha_expiracion BETWEEN NOW() AND NOW() + INTERVAL '7 days'
  AND activo = TRUE;
```

---

## 🐛 Troubleshooting

### Problema: Código de referido no se genera

**Solución:**
```sql
-- Verificar que la función existe
SELECT proname FROM pg_proc WHERE proname = 'generate_referral_code';

-- Re-crear función si no existe
-- Ejecutar script completo de migración
```

### Problema: Estadísticas no se actualizan

**Solución:**
```sql
-- Verificar que trigger existe
SELECT tgname FROM pg_trigger WHERE tgname = 'trigger_actualizar_estadisticas_cupon';

-- Verificar que se está insertando en cupones_usados_historial
SELECT * FROM cupones_usados_historial ORDER BY created_at DESC LIMIT 10;
```

### Problema: Cupón de categoría no valida correctamente

**Solución:**
```sql
-- Probar función manualmente
SELECT cupon_aplica_categoria(
  '[cupon-id]'::UUID,
  'Ropa'
);

-- Verificar que productos tienen categoría correcta
SELECT id, nombre, categoria FROM productos WHERE categoria = 'Ropa';
```

---

## 📚 Referencias

- [Documentación Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🎯 Conclusión

El sistema de cupones avanzados está **80% completado**. Las funcionalidades core están implementadas:

✅ Categorías específicas  
✅ Primera compra  
✅ Estadísticas de uso  
✅ Sistema de referidos  
✅ Tipos especiales de cupones  
✅ UI de admin mejorada  

**Falta:**
- 🔄 Función automática de cumpleaños (Edge Function + Cron)
- 🔄 Página de referidos para usuario
- 🔄 Validación completa en checkout
- 🔄 Dashboard de estadísticas con gráficas

**Próximo paso recomendado:**  
Ejecutar la migración SQL en Supabase y probar creación de cupones avanzados en Admin.

---

> 📅 **Última actualización:** 5 de noviembre de 2025  
> 📧 **Soporte:** cabezassebastian08@gmail.com  
> 🌐 **Proyecto:** mercadillo.app
