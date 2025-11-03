# 🚀 Mejoras y Nuevas Funcionalidades - Mercadillo

> Documento generado el 3 de noviembre de 2025  
> Análisis completo del proyecto para identificar oportunidades de mejora

---

## 📊 1. ANALYTICS Y MÉTRICAS AVANZADAS

### 1.1 Google Analytics 4 + Pixel Tracking
**Prioridad:** Alta | **Estimación:** 6 horas

**Implementar:**
- [ ] Google Analytics 4 con eventos personalizados
- [ ] Meta Pixel (Facebook/Instagram ads)
- [ ] TikTok Pixel (opcional para futuro marketing)
- [ ] Microsoft Clarity o Hotjar para heatmaps

**Eventos a trackear:**
```javascript
// Eventos principales
- view_item (Ver producto)
- add_to_cart (Agregar al carrito)
- remove_from_cart (Remover del carrito)
- begin_checkout (Iniciar checkout)
- purchase (Compra exitosa)
- add_to_wishlist (Agregar a favoritos)
- search (Búsqueda de productos)
- view_item_list (Ver catálogo)
- select_item (Click en producto)
```

**Archivos a crear:**
- `src/lib/analytics.ts` - Cliente analytics unificado
- `src/hooks/useTracking.ts` - Hook para eventos
- `.env.local` - Variables: `VITE_GA4_ID`, `VITE_META_PIXEL_ID`

---

### 1.2 Dashboard de Ventas Mejorado
**Prioridad:** Media | **Estimación:** 8 horas

**Características:**
- [ ] Gráfico de ventas por día/semana/mes (recharts)
- [ ] Comparación período actual vs anterior
- [ ] Filtros por categoría y rango de fechas
- [ ] Exportar reportes a CSV/PDF
- [ ] Predicción de ventas (machine learning básico)

**Métricas adicionales:**
- Ticket promedio
- Productos más devueltos
- Tiempo promedio de compra
- Tasa de abandono del carrito
- Valor de vida del cliente (CLV)

**Archivos:**
- `src/components/Admin/SalesChartAdvanced.tsx`
- `src/components/Admin/SalesReports.tsx`
- `sql-migrations/create-sales-analytics.sql`

---

### 1.3 Tasa de Conversión Detallada
**Prioridad:** Media | **Estimación:** 4 horas

**Implementar:**
- [ ] Tabla `product_views` para trackear vistas
- [ ] Embudo de conversión: Vista → Carrito → Checkout → Compra
- [ ] Análisis por fuente de tráfico
- [ ] Heatmap de clics en productos

**SQL necesario:**
```sql
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id),
  usuario_id TEXT,
  session_id TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔔 2. NOTIFICACIONES Y ALERTAS

### 2.1 Sistema de Notificaciones Push
**Prioridad:** Alta | **Estimación:** 10 horas

**Implementar:**
- [ ] Service Worker para PWA
- [ ] Push Notifications API
- [ ] Notificaciones en navegador (Web Push)
- [ ] Centro de notificaciones en el perfil

**Tipos de notificaciones:**
- Producto de wishlist en oferta
- Stock disponible de producto agotado
- Actualización de estado de pedido
- Nuevos productos en categorías favoritas
- Cupones personalizados

**Tecnologías:**
- Firebase Cloud Messaging (FCM)
- OneSignal (alternativa más simple)

**Archivos:**
- `public/service-worker.js`
- `src/lib/notifications.ts`
- `src/components/Notifications/NotificationCenter.tsx`

---

### 2.2 Alertas de Stock Bajo - Versión Cliente
**Prioridad:** Media | **Estimación:** 3 horas

**Implementar:**
- [ ] Modal "Notifícame cuando haya stock"
- [ ] Tabla `stock_alerts` con emails
- [ ] Cron job que envía emails cuando se repone
- [ ] Badge en ProductCard si el usuario tiene alerta activa

**Flujo:**
1. Usuario ve producto sin stock
2. Click en "Notifícame"
3. Se guarda email + producto_id
4. Cuando stock > 0, enviar email automático

---

## 💰 3. SISTEMA DE PAGOS Y FINANZAS

### 3.1 Múltiples Métodos de Pago
**Prioridad:** Alta | **Estimación:** 12 horas

**Agregar:**
- [ ] **Yape/Plin** (QR code + validación manual)
- [ ] **Transferencia bancaria** (número de cuenta + validación)
- [ ] **Pago contra entrega** (cash on delivery)
- [ ] **Wallet interno** (crédito en cuenta)

**Implementación Yape/Plin:**
```typescript
// Generar QR con número de teléfono
// Mostrar QR en checkout
// Guardar screenshot de comprobante
// Validación manual en admin
```

**Tabla necesaria:**
```sql
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id),
  payment_method TEXT, -- 'yape' | 'plin' | 'bank_transfer'
  proof_image TEXT, -- URL de Cloudinary
  transaction_id TEXT,
  amount DECIMAL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.2 Sistema de Crédito/Wallet
**Prioridad:** Media | **Estimación:** 8 horas

**Características:**
- [ ] Balance de crédito por usuario
- [ ] Recarga manual (admin)
- [ ] Descuento automático en checkout
- [ ] Historial de transacciones
- [ ] Devoluciones van al wallet

**Archivos:**
- `src/components/Wallet/WalletBalance.tsx`
- `src/components/Wallet/TransactionHistory.tsx`
- `sql-migrations/create-wallet-system.sql`

---

### 3.3 Cupones Avanzados
**Prioridad:** Media | **Estimación:** 6 horas

**Mejoras al sistema actual:**
- [ ] Cupones por categoría específica
- [ ] Cupones de primera compra automáticos
- [ ] Cupones de cumpleaños (envío automático)
- [ ] Cupones de "recuperar carrito abandonado"
- [ ] Sistema de referidos (código único por usuario)

**Nuevas columnas en `cupones`:**
```sql
ALTER TABLE cupones ADD COLUMN categoria TEXT;
ALTER TABLE cupones ADD COLUMN only_first_purchase BOOLEAN DEFAULT FALSE;
ALTER TABLE cupones ADD COLUMN referred_by TEXT; -- user_id que refirió
```

---

## 📦 4. GESTIÓN DE INVENTARIO

### 4.1 Alertas Automáticas de Stock Bajo
**Prioridad:** Alta | **Estimación:** 4 horas

**Implementar:**
- [ ] Email automático al admin cuando stock <= 5
- [ ] Resumen semanal de productos con stock bajo
- [ ] Sugerencias de reposición basadas en ventas
- [ ] Integración con proveedores (opcional)

**Archivos:**
- `supabase/functions/stock-alerts/index.ts`
- Cron job diario en Supabase

---

### 4.2 Sistema de Reservas
**Prioridad:** Media | **Estimación:** 6 horas

**Características:**
- [ ] Reservar stock cuando producto en carrito > 15 minutos
- [ ] Liberar reserva si no completa compra
- [ ] Indicador "X personas viendo este producto"
- [ ] Timer en carrito "Reservado por 15 minutos"

**Tabla:**
```sql
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY,
  producto_id UUID REFERENCES productos(id),
  variant_id UUID REFERENCES product_variants(id),
  usuario_id TEXT,
  quantity INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4.3 Historial de Movimientos de Inventario
**Prioridad:** Baja | **Estimación:** 5 horas

**Trackear:**
- Ventas (- stock)
- Devoluciones (+ stock)
- Ajustes manuales
- Productos dañados/perdidos

---

## 🛍️ 5. EXPERIENCIA DE COMPRA

### 5.1 Búsqueda Avanzada con Filtros
**Prioridad:** Alta | **Estimación:** 8 horas

**Mejorar búsqueda actual:**
- [ ] Búsqueda por voz (Web Speech API)
- [ ] Búsqueda por imagen (ML Kit o Google Vision)
- [ ] Autocompletado inteligente
- [ ] Corrección de typos
- [ ] Sinónimos (ej: "polo" = "camiseta")

**Filtros adicionales:**
- [ ] Por rango de precio avanzado (slider dual)
- [ ] Por valoración mínima
- [ ] Por disponibilidad de envío
- [ ] Por marca (si se agrega brands)
- [ ] Filtro combinado (ej: "Ropa + Rojo + < S/50")

---

### 5.2 Recomendaciones Inteligentes
**Prioridad:** Media | **Estimación:** 10 horas

**Implementar:**
- [ ] "Productos similares" (basado en categoría + precio)
- [ ] "Quién compró esto también compró..."
- [ ] "Basado en tu historial" (productos vistos)
- [ ] "Tendencias en tu zona" (si se captura ubicación)

**Algoritmos:**
- Collaborative filtering simple
- Content-based filtering (tags, categoría)
- Trending products (más vistos últimos 7 días)

**Archivos:**
- `src/lib/recommendations.ts`
- `src/components/Product/SmartRecommendations.tsx`

---

### 5.3 Comparador de Productos
**Prioridad:** Baja | **Estimación:** 6 horas

**Características:**
- [ ] Botón "Comparar" en ProductCard
- [ ] Tabla comparativa side-by-side
- [ ] Hasta 3-4 productos simultáneos
- [ ] Resaltar diferencias clave

---

### 5.4 Vista Rápida (Quick View)
**Prioridad:** Media | **Estimación:** 4 horas

**Implementar:**
- [ ] Modal rápido desde ProductCard
- [ ] Ver imágenes, precio, variantes sin salir del catálogo
- [ ] Agregar al carrito directamente
- [ ] Link a página completa si quiere más info

---

## 👤 6. PERFIL Y CUENTA DE USUARIO

### 6.1 Programa de Puntos/Fidelidad
**Prioridad:** Media | **Estimación:** 12 horas

**Sistema:**
- [ ] Ganar puntos por cada compra (1 punto = S/1)
- [ ] Puntos por reseñas (50 puntos)
- [ ] Puntos por referir amigos (200 puntos)
- [ ] Canjear puntos por cupones
- [ ] Niveles: Bronce → Plata → Oro → Platinum

**Beneficios por nivel:**
- Bronce: 0-500 pts
- Plata: 501-2000 pts (5% descuento extra)
- Oro: 2001-5000 pts (10% + envío gratis)
- Platinum: 5000+ pts (15% + early access)

**Tabla:**
```sql
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY,
  usuario_id TEXT UNIQUE,
  total_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE points_transactions (
  id UUID PRIMARY KEY,
  usuario_id TEXT,
  points INTEGER,
  type TEXT, -- 'earn' | 'redeem'
  reason TEXT,
  pedido_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 6.2 Direcciones Favoritas Mejorado
**Prioridad:** Baja | **Estimación:** 3 horas

**Mejoras:**
- [ ] Alias para direcciones ("Casa", "Trabajo", "Casa de mamá")
- [ ] Dirección predeterminada marcada con estrella
- [ ] Validación de código postal
- [ ] Integración con Google Maps para autocompletar

---

### 6.3 Historial de Navegación Mejorado
**Prioridad:** Baja | **Estimación:** 4 horas

**Ya existe pero mejorar:**
- [ ] Mostrar en sidebar del perfil
- [ ] "Volver a comprar" con 1 click
- [ ] Agrupar por fecha (Hoy, Ayer, Esta semana)
- [ ] Eliminar items individuales

---

## 📱 7. PWA Y MOBILE

### 7.1 Convertir a PWA Completa
**Prioridad:** Alta | **Estimación:** 6 horas

**Implementar:**
- [ ] Manifest completo con iconos
- [ ] Service Worker para caché offline
- [ ] Instalable en home screen
- [ ] Splash screen personalizada
- [ ] Modo standalone

**Archivos:**
- `public/manifest.json` ✅ (ya existe, mejorar)
- `public/sw.js` - Service Worker
- `public/icons/` - Iconos 192x192, 512x512

---

### 7.2 Modo Offline Básico
**Prioridad:** Media | **Estimación:** 8 horas

**Funcionalidades offline:**
- [ ] Ver productos cacheados
- [ ] Ver pedidos anteriores
- [ ] Agregar a lista de deseos (sincroniza después)
- [ ] Mensaje claro "Sin conexión"

---

## 🎨 8. UI/UX IMPROVEMENTS

### 8.1 Tema Personalizable
**Prioridad:** Baja | **Estimación:** 6 horas

**Opciones:**
- [ ] Selector de color primario (8 opciones)
- [ ] Modo oscuro automático (según hora del día)
- [ ] Tamaño de fuente (S/M/L para accesibilidad)
- [ ] Animaciones reducidas (accesibilidad)

---

### 8.2 Onboarding para Nuevos Usuarios
**Prioridad:** Media | **Estimación:** 5 horas

**Implementar:**
- [ ] Tour guiado con tooltips
- [ ] Video corto explicativo
- [ ] Checklist de primeros pasos
- [ ] Badge "Nuevo" primeros 7 días

---

### 8.3 Skeleton Loaders
**Prioridad:** Baja | **Estimación:** 4 horas

**Reemplazar spinners genéricos con:**
- [ ] Skeleton para ProductCard
- [ ] Skeleton para Product detail
- [ ] Skeleton para Admin tables
- [ ] Animación shimmer effect

---

## 📧 9. MARKETING Y EMAILS

### 9.1 Email Marketing Automatizado
**Prioridad:** Alta | **Estimación:** 10 horas

**Flujos automáticos:**
- [ ] **Welcome series** (3 emails en 7 días)
- [ ] **Carrito abandonado** (1h, 24h, 72h después)
- [ ] **Post-compra** (pedir reseña después de 7 días)
- [ ] **Reactivación** (30 días sin comprar)
- [ ] **Win-back** (90 días sin actividad)

**Herramientas:**
- Resend (ya integrado)
- O migrar a Mailchimp/SendGrid para más features

---

### 9.2 Newsletter y Blog
**Prioridad:** Baja | **Estimación:** 12 horas

**Crear sección de blog:**
- [ ] Artículos de moda/tendencias
- [ ] Guías de compra
- [ ] SEO optimizado
- [ ] Compartir en redes sociales

**CMS opciones:**
- Markdown files en `/content`
- Sanity.io (headless CMS)
- Contentful

---

## 🔒 10. SEGURIDAD Y PRIVACIDAD

### 10.1 Two-Factor Authentication (2FA)
**Prioridad:** Media | **Estimación:** 6 horas

**Implementar:**
- [ ] 2FA con SMS (Twilio)
- [ ] 2FA con Authenticator app
- [ ] Códigos de respaldo
- [ ] Forzar 2FA para compras > S/500

---

### 10.2 Detección de Fraude
**Prioridad:** Media | **Estimación:** 8 horas

**Reglas:**
- [ ] Bloquear si 3+ pagos fallidos en 1 hora
- [ ] Verificar si dirección de envío es sospechosa
- [ ] Limitar compras a nuevos usuarios (primeros 3 días)
- [ ] Integración con servicio antifraude (Sift, Stripe Radar)

---

### 10.3 GDPR y Privacidad
**Prioridad:** Alta | **Estimación:** 6 horas

**Implementar:**
- [ ] Cookie consent banner
- [ ] Exportar datos personales (GDPR)
- [ ] Eliminar cuenta completamente
- [ ] Política de cookies detallada

---

## 🚚 11. LOGÍSTICA Y ENVÍOS

### 11.1 Cálculo Dinámico de Envío
**Prioridad:** Alta | **Estimación:** 10 horas

**Integrar:**
- [ ] API de Shalom (servicio de envíos Perú)
- [ ] Cotización en tiempo real por distrito
- [ ] Múltiples opciones (Express, Estándar, Económico)
- [ ] Tracking en tiempo real

---

### 11.2 Punto de Recojo (Pickup Points)
**Prioridad:** Media | **Estimación:** 6 horas

**Implementar:**
- [ ] Mapa con puntos de recojo disponibles
- [ ] Seleccionar punto más cercano
- [ ] Notificación cuando llegue al punto
- [ ] QR code para retirar

---

### 11.3 Programar Entrega
**Prioridad:** Baja | **Estimación:** 5 horas

**Permitir:**
- [ ] Elegir fecha de entrega (calendario)
- [ ] Horario preferido (Mañana/Tarde/Noche)
- [ ] Reprogramar si no están en casa

---

## 📊 12. REPORTES Y ADMIN

### 12.1 Exportar Datos
**Prioridad:** Media | **Estimación:** 4 horas

**Exportar a:**
- [ ] CSV (pedidos, productos, usuarios)
- [ ] PDF (facturas, reportes)
- [ ] Excel (análisis avanzado)

---

### 12.2 Gestión de Roles
**Prioridad:** Media | **Estimación:** 6 horas

**Roles:**
- Super Admin (acceso total)
- Admin (gestionar productos, pedidos)
- Editor (solo productos)
- Soporte (ver pedidos, responder consultas)

**Implementar:**
- Tabla `admin_roles`
- Middleware de autorización

---

### 12.3 Logs de Auditoría
**Prioridad:** Baja | **Estimación:** 5 horas

**Trackear:**
- Quién editó qué producto
- Cambios en pedidos
- Usuarios bloqueados/desbloqueados
- Cupones creados/eliminados

---

## 🤖 13. CHATBOT Y IA

### 13.1 Chatbot con Imágenes
**Prioridad:** Media | **Estimación:** 8 horas

**Agregar:**
- [ ] Soporte para enviar imágenes
- [ ] Gemini Vision para analizar imagen
- [ ] "Buscar productos similares a esta imagen"

---

### 13.2 Respuestas Personalizadas
**Prioridad:** Baja | **Estimación:** 6 hours

**Mejorar:**
- [ ] Recordar contexto de conversaciones previas
- [ ] Sugerencias basadas en historial de compras
- [ ] Tono de voz personalizado (formal/casual)

---

## 🌐 14. SEO Y PERFORMANCE

### 14.1 SEO Avanzado
**Prioridad:** Alta | **Estimación:** 8 horas

**Implementar:**
- [ ] Sitemap XML dinámico
- [ ] Schema.org markup (Product, Review, Organization)
- [ ] Open Graph tags completos
- [ ] Meta descriptions únicas por página
- [ ] Canonical URLs
- [ ] Breadcrumbs

---

### 14.2 Performance Optimization
**Prioridad:** Alta | **Estimación:** 10 horas

**Optimizar:**
- [ ] Lazy loading de imágenes (ya parcial)
- [ ] Code splitting por rutas
- [ ] Prefetch de páginas principales
- [ ] Comprimir imágenes con Cloudinary automático
- [ ] CDN para assets estáticos
- [ ] Service Worker para cache estratégico

**Target:**
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s

---

## 📱 15. REDES SOCIALES

### 15.1 Login Social
**Prioridad:** Media | **Estimación:** 4 horas

**Agregar:**
- [ ] Google (ya en Clerk)
- [ ] Facebook
- [ ] Apple Sign In
- [ ] GitHub (opcional)

---

### 15.2 Compartir Productos
**Prioridad:** Baja | **Estimación:** 3 horas | ✅ **COMPLETADO**

**Botones de compartir:**
- [x] WhatsApp - Con mensaje personalizado de Mercadillo Lima Perú
- [x] Facebook - Publicación con marca Mercadillo 🇵🇪
- [x] Twitter/X - Tweet con hashtags #MercadilloPerú #CompraLocal
- [x] Pinterest - Pin con imagen del producto y descripción
- [x] Copiar link - Mensaje completo con precio y link del producto

**Implementación:**
- Menú desplegable con diseño moderno
- Mensajes personalizados por red social
- Incluye nombre del producto, precio en soles y marca Mercadillo
- URL completa del producto (mercadillo.app)
- Animación al copiar link (checkmark verde)
- Resalta "Lima, Perú 🇵🇪" en todos los mensajes

**Archivos creados:**
- `src/components/Product/ShareButtons.tsx` - Componente completo
- Integrado en `src/pages/Product.tsx` debajo del botón de wishlist

---

## 🎁 16. FUNCIONES ESPECIALES

### 16.1 Gift Cards / Tarjetas de Regalo
**Prioridad:** Baja | **Estimación:** 12 horas

**Sistema completo:**
- [ ] Comprar gift card con monto personalizado
- [ ] Código único generado
- [ ] Enviar por email a destinatario
- [ ] Canjear en checkout
- [ ] Balance restante si no usa todo

---

### 16.2 Pre-orders
**Prioridad:** Baja | **Estimación:** 8 horas

**Permitir:**
- [ ] Pre-ordenar productos no disponibles
- [ ] Fecha estimada de llegada
- [ ] Cobro parcial (30% ahora, 70% al enviar)
- [ ] Notificación cuando esté listo

---

### 16.3 Suscripciones
**Prioridad:** Baja | **Estimación:** 15 horas

**Productos recurrentes:**
- [ ] Entrega cada 15/30 días
- [ ] Descuento por suscripción
- [ ] Gestionar, pausar, cancelar
- [ ] Recordatorios antes de cobrar

---

## 🧪 17. TESTING Y CALIDAD

### 17.1 Tests Automatizados
**Prioridad:** Media | **Estimación:** 20 horas

**Implementar:**
- [ ] Unit tests (Vitest)
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests (Chromatic)

**Coverage objetivo:** > 70%

---

### 17.2 Monitoreo de Errores
**Prioridad:** Alta | **Estimación:** 4 horas

**Integrar:**
- [ ] Sentry para error tracking
- [ ] Source maps para debugging
- [ ] Alertas por email si error crítico
- [ ] Performance monitoring

---

## 📦 18. INTEGRACIONES EXTERNAS

### 18.1 ERP/Inventario
**Prioridad:** Baja | **Estimación:** Varía

**Integrar con:**
- [ ] Sistema de inventario externo
- [ ] Sincronización bidireccional
- [ ] Webhooks para actualizaciones

---

### 18.2 Contabilidad
**Prioridad:** Media | **Estimación:** 8 horas

**Exportar:**
- [ ] Formato para SUNAT (Perú)
- [ ] Generar comprobantes electrónicos
- [ ] Libro de ventas automático

---

## 🎯 PRIORIZACIÓN RECOMENDADA

### 🔥 Urgente (Próximas 2 semanas)
1. Google Analytics 4 + Pixels
2. PWA completa
3. Sistema de notificaciones push
4. SEO avanzado
5. Monitoreo de errores (Sentry)

### ⚡ Alta Prioridad (Próximo mes)
6. Métodos de pago adicionales (Yape/Plin)
7. Email marketing automatizado
8. Búsqueda avanzada
9. Alertas de stock al cliente
10. Performance optimization

### 📌 Media Prioridad (Próximos 3 meses)
11. Programa de fidelidad
12. Recomendaciones inteligentes
13. Dashboard de ventas mejorado
14. Sistema de reservas
15. Cálculo dinámico de envío

### 💡 Baja Prioridad (Backlog)
16. Gift cards
17. Suscripciones
18. Pre-orders
19. Blog/Newsletter
20. Comparador de productos

---

## 📈 IMPACTO ESTIMADO

| Función | Impacto en Ventas | Dificultad | ROI |
|---------|-------------------|------------|-----|
| Analytics + Pixels | ⭐⭐⭐⭐⭐ | Media | Alto |
| Notificaciones Push | ⭐⭐⭐⭐ | Alta | Alto |
| Yape/Plin | ⭐⭐⭐⭐⭐ | Media | Muy Alto |
| Email Marketing | ⭐⭐⭐⭐ | Media | Alto |
| Programa Fidelidad | ⭐⭐⭐⭐ | Alta | Medio |
| PWA | ⭐⭐⭐ | Media | Medio |
| SEO | ⭐⭐⭐⭐⭐ | Baja | Muy Alto |
| Búsqueda Avanzada | ⭐⭐⭐ | Media | Medio |

---

## 🛠️ STACK TECNOLÓGICO SUGERIDO

**Analytics:**
- Google Analytics 4
- Meta Pixel
- Microsoft Clarity

**Push Notifications:**
- Firebase Cloud Messaging
- O OneSignal (más fácil)

**Email Marketing:**
- Resend (actual) ✅
- Mailchimp (features avanzadas)

**Error Monitoring:**
- Sentry
- LogRocket (session replay)

**Testing:**
- Vitest (unit)
- Playwright (E2E)
- React Testing Library

**Performance:**
- Lighthouse CI
- WebPageTest
- Bundle Analyzer

---

## 💰 ESTIMACIÓN DE COSTOS

**Servicios mensuales:**
- Sentry: $0-26/mes (plan Team)
- OneSignal: $0-99/mes (hasta 30K usuarios)
- Mailchimp: $0-299/mes (depende de lista)
- Cloudinary: $0 (plan gratuito actual OK)
- Google Analytics: Gratis
- Meta Pixel: Gratis

**Desarrollo:**
- Si contratas freelancer: S/30-80/hora
- Estimación total: 200-300 horas
- Costo desarrollo: S/6,000 - S/24,000

**Recomendación:**
Implementar por fases, priorizando quick wins (SEO, Analytics, Yape/Plin)

---

## 📝 NOTAS FINALES

Este documento es una guía completa pero **no es necesario implementar todo**. 

**Estrategia recomendada:**
1. Implementar analytics AHORA (visibilidad)
2. Optimizar SEO (tráfico orgánico)
3. Agregar Yape/Plin (conversión en Perú)
4. Email marketing (retención)
5. Resto según feedback de usuarios

**Próximo paso:**
Revisar este documento con el equipo y crear un roadmap trimestral priorizado.

---

> 📅 **Última actualización:** 3 de noviembre de 2025  
> 📧 **Contacto:** cabezassebastian08@gmail.com  
> 🌐 **Proyecto:** mercadillo.app
