
# 🚀 Roadmap de Mejoras - Mercadillo (ENFOCADO)

> Documento de seguimiento de mejoras prioritarias solicitadas

**Última actualización:** 5 de Octubre, 2025  
**Versión actual:** v1.0.0

---

## 📊 Estado General del Proyecto

- ✅ **Completado:** 4/8 tareas principales (50%)
- 🔄 **En Progreso:** 0/8 tareas principales
- ⏳ **Pendiente:** 4/8 tareas principales
- **Progreso Total:** 50%

## 🎉 Últimas Mejoras Completadas (Octubre 2025)

### ✅ Sistema de Emails Mejorado
- [x] Rediseño completo con colores de marca (#FFD700 - amarillo)
- [x] Animaciones suaves (bounce, float, scaleIn)
- [x] Rutas corregidas (/perfil/pedidos, /perfil/reseñas, /catalogo)
- [x] Email de envío con timeline visual
- [x] Email de entrega con sección de reseñas
- [x] Compatibilidad con Vercel (HTML inline)

### ✅ Panel Admin - Mejoras UX
- [x] Animaciones de filtros (slide-up/down 150ms)
- [x] Animaciones de modal (scale-up/down 200ms)
- [x] Backdrop con blur effects
- [x] Botones de estado: Pendiente (naranja), Cancelar (rojo)
- [x] Botones de email: Marcar como Enviado (morado), Marcar como Entregado (verde)
- [x] Descripciones de productos truncadas a 15 caracteres

### ✅ Actualización de Información de Envío
- [x] Cambio de "Olva Courier" a "Shalom"
- [x] Eliminación de estimaciones de tiempo "(3-5 días hábiles)"
- [x] Actualizado en Checkout y Admin Orders

### ✅ Menú Hamburguesa Mejorado (Mobile)
- [x] Animación slide-in desde la derecha (300ms ease-in-out)
- [x] Overlay oscuro con backdrop-blur y fade animation
- [x] Swipe gesture para cerrar (deslizar hacia la izquierda)
- [x] Animaciones suaves al abrir y cerrar
- [x] Botones de autenticación con estilo consistente (btn-primary)
- [x] Posicionamiento correcto debajo del navbar (top-20)
- [x] Responsive optimizado para pantallas pequeñas

### ✅ Hero Section Responsive (Home Page)
- [x] Botones optimizados para móviles (375x667)
- [x] Tamaños de fuente escalables (text-sm → text-lg)
- [x] Padding adaptativo según viewport
- [x] Ancho completo en móvil con max-width
- [x] Espaciado mejorado entre elementos
- [x] Título responsive (text-2xl → text-6xl)

### ✅ Galería de Imágenes de Producto
- [x] Tabla `producto_imagenes` en BD con RLS y triggers
- [x] Múltiples imágenes por producto con orden personalizable
- [x] Componente ProductGallery con thumbnails navegables
- [x] Zoom al hover en desktop (escala 150%)
- [x] Modal fullscreen con navegación por teclado
- [x] Swipe gestures para mobile
- [x] Flechas de navegación y contador de imágenes
- [x] Selector de imagen principal
- [x] Panel de administración (ProductImageManager)
- [x] Subida múltiple de imágenes
- [x] Reordenamiento drag-free (flechas arriba/abajo)
- [x] Migración automática de imágenes existentes

---

## 📋 TAREAS PRIORITARIAS

### 1. Filtros Avanzados en Catálogo ✅
- [x] Filtro por disponibilidad en stock (toggle "Solo productos disponibles")
- [x] Ordenamiento por "más vendidos" (requiere campo total_vendidos en BD)
- [x] Filtro por calificación (4★+, 3★+, 2★+) (requiere campo rating_promedio en BD)
- [x] Contador de filtros activos en botón "Filtros"
- [x] UI mejorada estilo Saga Falabella (sidebar desktop + drawer mobile)
- [x] Botón "Limpiar filtros" actualizado
- [x] Sidebar permanente 280px en desktop
- [x] Drawer mobile con overlay y slide-in animation
- [x] Ordenamiento completo: Más recientes, Más vendidos, Precio ↑, Precio ↓, A-Z, Z-A, Mayor stock

**Archivos modificados:**
- ✅ `src/pages/Catalog.tsx` - Restructurado layout completo
- ✅ `src/lib/supabase.ts` - Tipos actualizados (rating_promedio, total_vendidos)
- ✅ `migration-advanced-filters.sql` - Nueva migración creada

### 4. Checkout Mejorado
- [x] Efectivo contra entrega (COD)
- [ ] Cálculo de envío por distrito y monto

### 7. Galería de Imágenes de Producto ✅
- [x] Múltiples imágenes por producto
- [x] Thumbnails navegables
- [x] Zoom al hacer hover
- [x] Modo fullscreen/modal
- [x] Swipe en mobile

### 10. Mejoras Mobile ✅
- [x] Paginación en catálogo (20 productos por página con controles)
- [x] Menú hamburguesa mejorado (slide-in desde derecha, overlay, swipe-to-close)
- [x] Gestos de swipe en galería
- [x] Botones responsive en Hero (optimizado para 375x667)

### 12. Filtros de Reseñas
- [ ] Filtro por calificación
- [ ] Ordenar por "más útiles"
- [ ] Filtro "solo compra verificada"

### 14. Recomendaciones en Producto
- [ ] Sección "Productos relacionados" en página de producto
- [ ] Algoritmo por categoría y precio

### 15. Dashboard Mejorado
- [ ] Gráfica de ventas (día/semana/mes)
- [ ] Top productos más vendidos
- [ ] Alertas de stock bajo
- [ ] Tasa de conversión

### 17. Estadísticas de Uso de Cupones
- [ ] Veces usado
- [ ] Total descuento aplicado
- [ ] Gráfica de uso por cupón

---

**Actualiza este roadmap marcando cada tarea como completada, en progreso o pendiente.**

### 1. Sistema de Búsqueda Avanzada ⏳
**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 4 horas

**✅ Ya implementado:**
- [x] Filtro por categoría
- [x] Filtro por rango de precio (min-max)
- [x] Ordenamiento por precio, nombre, stock, newest
- [x] Búsqueda por texto

**⏳ Por implementar:**
- [ ] Filtro por disponibilidad en stock (toggle "Solo disponibles")
- [ ] Búsqueda por múltiples categorías simultáneas
- [ ] Ordenamiento por "más vendidos"
- [ ] Filtro por calificación (4★+, 3★+, etc.)

**Archivos a modificar:**
- `src/pages/Catalog.tsx`
- Agregar campo `rating_promedio` a tabla `productos`
- Agregar campo `total_vendidos` a tabla `productos`

---

### 2. Carrito Persistente ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 6 horas

**Tareas:**
- [ ] Migrar carrito de localStorage a Supabase
- [ ] Crear tabla `carritos` en base de datos
- [ ] Sincronizar carrito entre dispositivos
- [ ] Recuperar carrito al iniciar sesión
- [ ] Notificaciones cuando productos en carrito bajan de precio

**Archivos a crear/modificar:**
- Crear: `sql-migrations/create-carritos-table.sql`
- Modificar: `src/contexts/CartContext.tsx`
- Crear: `src/lib/cart.ts`

---

### 3. Sistema de Notificaciones por Email ⏳
**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 8 horas

**Servicios a integrar:**
- [ ] Configurar Resend o SendGrid
- [ ] Email de confirmación de pedido
- [ ] Email cuando producto vuelve a stock (wishlist)
- [ ] Email cuando baja precio de productos en wishlist
- [ ] Email de bienvenida a nuevos usuarios
- [ ] Email de recuperación de carrito abandonado (24h)

**Archivos a crear:**
- `api/send-email.ts`
- `src/lib/email-templates/`
  - `order-confirmation.html`
  - `back-in-stock.html`
  - `price-drop.html`
  - `welcome.html`
- `.env.local`: Agregar `RESEND_API_KEY`

---

## 🛍️ Experiencia de Compra

### 4. Checkout Mejorado ⏳
**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 10 horas

#### 4.1 Efectivo Contra Entrega
- [ ] Agregar selector de método de pago en UI
- [ ] Agregar columna `metodo_pago` a tabla `pedidos`
- [ ] Agregar columna `estado_pago` a tabla `pedidos`
- [ ] Implementar flujo de creación de pedido sin MercadoPago
- [ ] Agregar cargo extra por pago contra entrega (S/ 5-10)
- [ ] Limitar zonas de entrega para COD
- [ ] Validar monto máximo para COD (S/ 500)
- [ ] Email de confirmación con instrucciones

**Archivos a modificar:**
- `src/pages/Checkout.tsx`
- `sql-migrations/add-payment-method-to-pedidos.sql`

#### 4.2 Cupones en Checkout UI
- [ ] Input para código de cupón
- [ ] Validación en tiempo real
- [ ] Mostrar descuento aplicado en resumen
- [ ] Mensaje de error si cupón inválido/expirado
- [ ] Guardar relación en `cupones_usados`

**Archivos a modificar:**
- `src/pages/Checkout.tsx`
- `src/lib/cupones.ts`

#### 4.3 Cálculo de Envío
- [ ] Crear tabla `tarifas_envio` con distritos y costos
- [ ] Selector de distrito en formulario
- [ ] Cálculo automático según distrito seleccionado
- [ ] Envío gratis para compras >S/ 50
- [ ] Mostrar tiempo estimado de entrega
- [ ] Validar cobertura de entrega

**Archivos a crear/modificar:**
- Crear: `sql-migrations/create-tarifas-envio.sql`
- Modificar: `src/pages/Checkout.tsx`
- Crear: `src/lib/shipping.ts`

---

### 5. Tracking de Pedidos ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 12 horas

**Estados del pedido:**
- [ ] Confirmado
- [ ] Preparando
- [ ] En camino
- [ ] Entregado
- [ ] Cancelado

**Funcionalidades:**
- [ ] Página de seguimiento de pedido
- [ ] Historial de estados con timestamps
- [ ] Número de seguimiento
- [ ] Notificaciones por email en cada cambio de estado
- [ ] Timeline visual de progreso
- [ ] Estimación de fecha de entrega

**Archivos a crear/modificar:**
- Crear: `src/pages/OrderTracking.tsx`
- Crear: `sql-migrations/add-order-tracking.sql`
- Crear: `src/components/Order/OrderTimeline.tsx`
- Modificar: `src/pages/OrdersPage.tsx`

---

### 6. Gestión de Direcciones ⏳
**Estado:** Pendiente  
**Prioridad:** Baja (Ya existe parcialmente)  
**Estimación:** 4 horas

**Mejoras:**
- [ ] Editar direcciones existentes
- [ ] Eliminar direcciones
- [ ] Validación de zona de cobertura
- [ ] Autocompletar con Google Maps API (opcional)
- [ ] UI mejorada para selección de dirección en checkout

**Archivos a modificar:**
- `src/pages/AddressesPage.tsx`
- `src/lib/userProfile.ts`

---

## 📱 UI/UX Enhancements

### 7. Galería de Imágenes de Producto ✅
**Estado:** Completado  
**Prioridad:** Alta  
**Estimación:** 8 horas
**Tiempo real:** ~3 horas

**Funcionalidades:**
- [x] Crear tabla `producto_imagenes` en BD
- [x] Subir múltiples imágenes por producto (admin)
- [x] Selector de imagen principal
- [x] Orden personalizable de imágenes
- [x] Thumbnails navegables con flechas
- [x] Imagen grande al seleccionar thumbnail
- [x] Zoom al hacer hover (2x-3x)
- [x] Modo fullscreen (modal)
- [x] Swipe en mobile para cambiar imagen

**Archivos creados:**
- ✅ `sql-migrations/create-producto-imagenes.sql`
- ✅ `src/components/Product/ProductGallery.tsx`
- ✅ `src/components/Admin/ProductImageManager.tsx`

**Archivos modificados:**
- ✅ `src/lib/supabase.ts` - Tipo ProductoImagen
- ✅ `src/pages/Product.tsx` - Integración galería
- ✅ `src/components/Admin/AdminProducts.tsx` - Gestión imágenes

---

### 8. Comparador de Productos ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 6 horas

**Funcionalidades:**
- [ ] Checkbox en ProductCard para seleccionar
- [ ] Botón flotante "Comparar (X)" cuando hay seleccionados
- [ ] Página/Modal de comparación
- [ ] Vista lado a lado (máximo 4 productos)
- [ ] Resaltar diferencias clave
- [ ] Comparar: precio, stock, categoría, rating

**Archivos a crear:**
- `src/pages/CompareProducts.tsx`
- `src/components/Product/ProductComparison.tsx`
- `src/contexts/CompareContext.tsx`

---

### 9. Vista Rápida (Quick View) ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 4 horas

**Funcionalidades:**
- [ ] Botón "Vista rápida" en ProductCard al hover
- [ ] Modal con info esencial del producto
- [ ] Imagen principal + precio + stock
- [ ] Botón "Agregar al carrito" directo
- [ ] Botón "Ver más detalles" → producto completo
- [ ] No sale del catálogo

**Archivos a crear:**
- `src/components/Product/QuickViewModal.tsx`

**Archivos a modificar:**
- `src/components/Product/ProductCard.tsx`

---

### 10. Mejoras Mobile ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 6 horas

#### 10.1 Scroll Infinito
- [ ] Implementar IntersectionObserver
- [ ] Cargar 20 productos iniciales
- [ ] Cargar +20 al llegar al final
- [ ] Spinner de carga "Cargando más..."
- [ ] Mantener posición al volver atrás

**Archivos a modificar:**
- `src/pages/Catalog.tsx`

#### 10.2 Menú Hamburguesa Mejorado ✅
- [x] Animación suave de apertura/cierre (300ms ease-in-out)
- [x] Overlay oscuro con backdrop-blur y fade animation
- [x] Menu desliza desde el lado derecho
- [x] Cerrar con swipe hacia la izquierda (threshold 50px)
- [x] Botones de autenticación con estilo consistente
- [x] Animación al abrir y cerrar (no solo al cerrar)
- [x] Posicionamiento correcto debajo del navbar

**Archivos modificados:**
- ✅ `src/components/Layout/Navbar.tsx`

#### 10.3 Gestos de Swipe
- [ ] Swipe en galería de imágenes
- [ ] Swipe para volver atrás en producto
- [ ] Swipe para eliminar item del carrito

---

## ⭐ Sistema de Reseñas Mejorado

### 11. Reseñas con Imágenes ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 6 horas

**Funcionalidades:**
- [ ] Crear tabla `resena_imagenes`
- [ ] Upload de imágenes en formulario de reseña
- [ ] Máximo 3-5 imágenes por reseña
- [ ] Galería de fotos de clientes
- [ ] Modal para ver imagen en grande
- [ ] Botón "Marcar como útil" en reseñas
- [ ] Contador de votos útiles

**Archivos a crear/modificar:**
- Crear: `sql-migrations/add-review-images.sql`
- Modificar: `src/components/Reviews/ReviewForm.tsx`
- Modificar: `src/components/Reviews/ReviewCard.tsx`
- Crear: `src/components/Reviews/ReviewImageGallery.tsx`

---

### 12. Filtros de Reseñas ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 3 horas

**Funcionalidades:**
- [ ] Filtro por calificación (5★, 4★, 3★, etc.)
- [ ] Ordenar por "Más útiles"
- [ ] Ordenar por "Más recientes"
- [ ] Filtro "Solo compra verificada"
- [ ] Contador de reseñas por estrella

**Archivos a modificar:**
- `src/pages/ReviewsPage.tsx`
- `src/components/Reviews/ReviewFilters.tsx` (nuevo)

---

## 🎨 Personalización

### 13. Temas y Colores ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 4 horas

**Funcionalidades:**
- [ ] Selector de tema (claro/oscuro/auto)
- [ ] Guardar preferencia en localStorage
- [ ] Transiciones suaves entre temas
- [ ] Modo de alto contraste (accesibilidad)

**Archivos a modificar:**
- `src/components/ThemeToggle.tsx`
- `src/contexts/ThemeContext.tsx`

---

### 14. Recomendaciones Personalizadas ⏳
**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 6 horas

#### 14.1 En Página de Producto
- [ ] Sección "Productos relacionados"
- [ ] Algoritmo: Misma categoría + rango de precio similar
- [ ] Carrusel con 4-6 productos
- [ ] "Otros clientes también compraron"
- [ ] Basado en pedidos que incluyen el producto actual

**Archivos a modificar:**
- `src/pages/Product.tsx`
- Crear: `src/components/Product/RelatedProducts.tsx`
- Crear: `src/lib/recommendations.ts`

#### 14.2 En Home
- [ ] "Quizás te interese" basado en historial
- [ ] "Más vendidos de la semana"
- [ ] "Nuevos productos"

**Archivos a modificar:**
- `src/pages/Home.tsx`

---

## 📊 Panel de Admin Mejorado

### 15. Dashboard con Analytics ⏳
**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 10 horas

**✅ Ya implementado:**
- [x] Total productos, pedidos, usuarios
- [x] Ingresos totales
- [x] Pedidos hoy y del mes
- [x] Promedio por pedido

**⏳ Por implementar:**

#### 15.1 Gráfica de Ventas
- [ ] Chart.js o Recharts integrado
- [ ] Gráfica de líneas: Ventas por día (últimos 7 días)
- [ ] Gráfica de barras: Ventas por semana (últimas 4 semanas)
- [ ] Gráfica de área: Ventas por mes (últimos 12 meses)
- [ ] Selector de período (día/semana/mes)

#### 15.2 Top Productos Más Vendidos
- [ ] Crear función SQL `get_top_selling_products()`
- [ ] Top 5 productos con cantidad vendida
- [ ] Mostrar ingresos generados por producto
- [ ] Link directo al producto

#### 15.3 Tasa de Conversión
- [ ] Trackear visitas a productos (agregar tabla `product_views`)
- [ ] Calcular: (Pedidos / Visitas) * 100
- [ ] Mostrar en card del dashboard

#### 15.4 Alertas de Stock Bajo
- [ ] Lista de productos con stock <= 5
- [ ] Badge de alerta en sidebar
- [ ] Ordenar por stock más bajo primero
- [ ] Link rápido para editar producto

**Archivos a crear/modificar:**
- Modificar: `src/components/Admin/AdminDashboard.tsx`
- Crear: `sql-migrations/create-analytics-functions.sql`
- Crear: `src/components/Admin/SalesChart.tsx`
- Crear: `src/components/Admin/TopProducts.tsx`
- Crear: `src/components/Admin/LowStockAlert.tsx`

---

### 16. Gestión de Inventario ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 8 horas

**Funcionalidades:**
- [ ] Importar productos desde CSV/Excel
- [ ] Exportar productos a CSV/Excel
- [ ] Edición masiva de precios (% descuento)
- [ ] Edición masiva de stock
- [ ] Historial de cambios de precio
- [ ] Variantes de producto (tallas, colores) - opcional

**Archivos a crear:**
- `src/components/Admin/BulkImport.tsx`
- `src/components/Admin/BulkEdit.tsx`
- `src/lib/csv-parser.ts`

---

### 17. Gestión de Cupones UI ⏳
**Estado:** Parcialmente implementado  
**Prioridad:** Media  
**Estimación:** 4 horas

**✅ Ya implementado:**
- [x] Crear cupones desde admin
- [x] Editar cupones
- [x] Eliminar cupones
- [x] Ver lista de cupones

**⏳ Por implementar:**

#### 17.1 Estadísticas de Uso
- [ ] Agregar columna `veces_usado` a tabla `cupones`
- [ ] Agregar columna `total_descuento_aplicado`
- [ ] Trigger para actualizar stats al usar cupón
- [ ] Mostrar en tabla: veces usado / máximo usos
- [ ] Gráfica de uso por cupón
- [ ] Total ahorrado por cupón

#### 17.2 Mejoras de UI
- [ ] Cupones por categoría específica
- [ ] Cupones por producto específico
- [ ] Vista previa del cupón (cómo se ve para el cliente)
- [ ] Duplicar cupón existente

**Archivos a modificar:**
- `src/components/Admin/AdminCoupons.tsx`
- `sql-migrations/add-coupon-stats.sql`

---

## 🚀 Marketing y Growth

### 18. Newsletter ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 6 horas

**Funcionalidades:**
- [ ] Crear tabla `newsletter_subscribers`
- [ ] Popup de suscripción (aparecer después de 30s)
- [ ] Input de email en footer
- [ ] Cupón de descuento 10% al suscribirse
- [ ] Confirmación por email (double opt-in)
- [ ] Panel admin para ver suscriptores
- [ ] Integración con servicio de email marketing

**Archivos a crear:**
- `src/components/Newsletter/NewsletterPopup.tsx`
- `src/components/Newsletter/NewsletterFooter.tsx`
- `sql-migrations/create-newsletter-table.sql`
- `src/components/Admin/NewsletterSubscribers.tsx`

---

### 19. Programa de Referidos ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 10 horas

**Funcionalidades:**
- [ ] Generar código único por usuario
- [ ] Página "Invita a tus amigos"
- [ ] Tracking de referidos
- [ ] Descuento para ambos (10% referidor + 15% referido)
- [ ] Dashboard de referidos del usuario
- [ ] Contador de referidos exitosos
- [ ] Historial de recompensas ganadas

**Archivos a crear:**
- `sql-migrations/create-referral-system.sql`
- `src/pages/ReferralPage.tsx`
- `src/components/Referral/ReferralDashboard.tsx`
- `src/lib/referrals.ts`

---

### 20. Blog/Contenido ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 12 horas

**Funcionalidades:**
- [ ] Sistema de blog con MDX
- [ ] Categorías de blog
- [ ] Artículos relacionados a productos
- [ ] SEO optimizado para cada artículo
- [ ] Comentarios en artículos (opcional)
- [ ] Panel admin para gestionar blog

**Temas sugeridos:**
- Guías de decoración
- Tendencias de diseño
- Cuidado de productos
- Ideas para el hogar

**Archivos a crear:**
- `src/pages/Blog.tsx`
- `src/pages/BlogPost.tsx`
- `content/blog/` (artículos en MDX)
- `src/components/Blog/BlogCard.tsx`

---

## 🔒 Seguridad y Confiabilidad

### 21. Verificación de Stock en Tiempo Real ⏳
**Estado:** Pendiente  
**Prioridad:** Alta  
**Estimación:** 6 horas

**Funcionalidades:**
- [ ] Verificar stock antes de agregar al carrito
- [ ] Reserva temporal de stock (15 min) al agregar al carrito
- [ ] Liberar stock si usuario no finaliza compra
- [ ] Notificación si producto se agotó durante checkout
- [ ] Actualizar stock en tiempo real con Supabase Realtime

**Archivos a crear/modificar:**
- Crear: `sql-migrations/create-stock-reservations.sql`
- Crear: `src/lib/stock-manager.ts`
- Modificar: `src/contexts/CartContext.tsx`
- Modificar: `src/pages/Checkout.tsx`

---

### 22. Política de Devoluciones ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 8 horas

**Funcionalidades:**
- [ ] Página de Política de Devoluciones
- [ ] Formulario de solicitud de devolución
- [ ] Estados: Solicitada → Aprobada → En tránsito → Completada
- [ ] Panel admin para gestionar devoluciones
- [ ] Tracking de devolución
- [ ] Reembolso automático o manual

**Archivos a crear:**
- `sql-migrations/create-returns-table.sql`
- `src/pages/ReturnsPage.tsx`
- `src/pages/ReturnRequest.tsx`
- `src/components/Admin/AdminReturns.tsx`

---

## 📈 Optimizaciones Técnicas

### 23. SEO Avanzado ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 6 horas

**Funcionalidades:**
- [ ] Metatags dinámicas por producto
- [ ] Schema.org markup (Product, Review, Organization)
- [ ] Open Graph para redes sociales
- [ ] Twitter Cards
- [ ] Sitemap dinámico actualizado
- [ ] robots.txt optimizado
- [ ] Canonical URLs

**Archivos a crear/modificar:**
- Crear: `src/components/SEO/MetaTags.tsx`
- Crear: `src/components/SEO/StructuredData.tsx`
- Modificar: `public/sitemap.xml` → Generar dinámicamente
- Modificar: Todos los pages con SEO

---

### 24. Performance ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 8 horas

**Optimizaciones:**
- [ ] Code splitting por ruta
- [ ] Lazy loading de componentes pesados
- [ ] PWA (Progressive Web App)
  - [ ] Service Worker
  - [ ] Manifest.json mejorado
  - [ ] Instalable en mobile
  - [ ] Funciona offline (catálogo en caché)
- [ ] CDN para assets estáticos (Cloudinary)
- [ ] Compresión de imágenes automática
- [ ] Bundle analyzer y optimización
- [ ] Preload de rutas críticas

**Archivos a crear/modificar:**
- Crear: `public/sw.js`
- Modificar: `vite.config.ts` (PWA plugin)
- Modificar: `public/manifest.json`

---

### 25. Analytics ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 4 horas

**Servicios a integrar:**
- [ ] Google Analytics 4
- [ ] Meta Pixel (Facebook/Instagram)
- [ ] TikTok Pixel (opcional)
- [ ] Hotjar o Microsoft Clarity (heatmaps)
- [ ] Conversion tracking
- [ ] Event tracking personalizado:
  - View Product
  - Add to Cart
  - Begin Checkout
  - Purchase
  - Add to Wishlist

**Archivos a crear:**
- `src/lib/analytics.ts`
- `.env.local`: Agregar IDs de tracking

---

## 🎁 Features Diferenciales

### 26. Wishlist Social ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 8 horas

**Funcionalidades:**
- [ ] Hacer wishlist pública (compartible)
- [ ] URL única por wishlist: `/wishlist/[userId]`
- [ ] Lista de regalos (bodas, cumpleaños, baby shower)
- [ ] Marcar productos como "Ya comprado"
- [ ] Notificar al dueño cuando alguien compra de su lista
- [ ] Sistema de prioridad (alta, media, baja)

**Archivos a crear/modificar:**
- Modificar: `sql-migrations/update-wishlist-public.sql`
- Crear: `src/pages/PublicWishlist.tsx`
- Modificar: `src/pages/Profile.tsx`

---

### 27. Chat en Vivo ⏳
**Estado:** Pendiente  
**Prioridad:** Media  
**Estimación:** 6 horas

**Opciones:**
- [ ] Integración con WhatsApp Business
  - [ ] Botón flotante de WhatsApp
  - [ ] Mensaje prellenado con contexto
- [ ] Chatbot básico (opcional)
  - [ ] Preguntas frecuentes
  - [ ] Horarios de atención
  - [ ] Redirección a WhatsApp si necesita humano

**Archivos a crear:**
- `src/components/Chat/WhatsAppButton.tsx`
- `src/components/Chat/Chatbot.tsx` (opcional)

---

### 28. Programa de Fidelidad ⏳
**Estado:** Pendiente  
**Prioridad:** Baja  
**Estimación:** 12 horas

**Funcionalidades:**
- [ ] Sistema de puntos por compra
- [ ] 1 punto = S/ 1 gastado
- [ ] Niveles: Bronce (0-100) / Plata (101-500) / Oro (501+)
- [ ] Beneficios por nivel:
  - Bronce: 5% descuento en cumpleaños
  - Plata: 10% descuento permanente + envío gratis
  - Oro: 15% descuento + envío gratis + acceso temprano ofertas
- [ ] Panel de puntos en perfil de usuario
- [ ] Canje de puntos por descuentos
- [ ] Historial de puntos ganados/gastados

**Archivos a crear:**
- `sql-migrations/create-loyalty-program.sql`
- `src/pages/LoyaltyPage.tsx`
- `src/components/Loyalty/PointsCard.tsx`
- `src/lib/loyalty.ts`

---

## 📝 Notas de Implementación

### Orden Sugerido de Desarrollo

**Sprint 1 (Semana 1-2):** Alta prioridad
1. ✅ Galería de imágenes (#7)
2. ✅ Productos relacionados (#14.1)
3. ✅ Cupones en Checkout UI (#4.2)
4. ✅ Dashboard Analytics (#15)

**Sprint 2 (Semana 3-4):** Mejoras de compra
5. ✅ Cálculo de envío (#4.3)
6. ✅ Tracking de pedidos (#5)
7. ✅ Notificaciones por email (#3)
8. ✅ Stock en tiempo real (#21)

**Sprint 3 (Semana 5-6):** UX y Mobile
9. ✅ Scroll infinito (#10.1)
10. ✅ Filtros de reseñas (#12)
11. ✅ Vista rápida (#9)
12. ✅ Búsqueda avanzada (#1)

**Sprint 4 (Semana 7-8):** Marketing y Growth
13. ✅ Newsletter (#18)
14. ✅ SEO avanzado (#23)
15. ✅ Analytics (#25)
16. ✅ WhatsApp chat (#27)

**Sprint 5+ (Backlog):** Features adicionales
- Programa de referidos (#19)
- Blog (#20)
- Programa de fidelidad (#28)
- Wishlist social (#26)

---

## 🔧 Dependencias a Instalar

```bash
# Analytics y SEO
pnpm add react-ga4 react-facebook-pixel
pnpm add next-seo @vercel/analytics

# Charts y visualización
pnpm add recharts chart.js react-chartjs-2

# Email
pnpm add resend @react-email/components

# CSV/Excel
pnpm add papaparse xlsx
pnpm add -D @types/papaparse

# PWA
pnpm add vite-plugin-pwa workbox-window

# Zoom de imágenes
pnpm add react-medium-image-zoom

# Swipe gestures
pnpm add react-swipeable
```

---

## 📚 Recursos y Referencias

- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)
- [Resend Email API](https://resend.com/docs)
- [React Email Templates](https://react.email)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)

---

## 🎯 KPIs a Medir

Una vez implementadas las mejoras, medir:

- **Tasa de conversión:** Meta >2%
- **Valor promedio de pedido:** Meta >S/ 150
- **Tasa de abandono de carrito:** Meta <60%
- **Tiempo en sitio:** Meta >3 minutos
- **Productos por pedido:** Meta >2
- **Retorno de clientes:** Meta >30%
- **CTR de recomendaciones:** Meta >5%
- **Uso de cupones:** Meta >15% de pedidos

---

## 📝 Registro de Cambios Recientes

### Octubre 5, 2025

#### Emails Mejorados (api/emails/)
**Archivos modificados:**
- `send-shipping.ts` - Email de confirmación de envío
- `send-delivery.ts` - Email de confirmación de entrega

**Cambios:**
- Reemplazo completo de color dorado (#b8860b) por amarillo marca (#FFD700)
- Animaciones CSS: bounce, float, scaleIn
- Timeline visual con gradientes
- Enlaces corregidos a rutas correctas
- Email de soporte actualizado: contomercadillo@gmail.com

#### Admin Panel UX (src/components/Admin/)
**Archivos modificados:**
- `AdminOrders.tsx` - Panel de gestión de pedidos
- `AdminProducts.tsx` - Panel de gestión de productos

**Cambios en AdminOrders:**
- Dropdown de filtros con animación slide (150ms)
- Modal con animación scale (200ms)
- Backdrop con blur effect
- Click fuera para cerrar con animación
- Botones de cambio de estado restaurados
- Info de envío actualizada: "Shalom" (sin timeframe)

**Cambios en AdminProducts:**
- Descripción truncada a 15 caracteres + "..."
- Tamaños de tabla mantenidos originales

#### Checkout y Envíos (src/pages/)
**Archivos modificados:**
- `Checkout.tsx` - Página de checkout

**Cambios:**
- Método de entrega actualizado: "Entrega a través de Shalom"
- Removido: "(3-5 días hábiles)"
- Texto más limpio y genérico

#### CSS Global (src/index.css)
**Nuevas animaciones agregadas:**
```css
@keyframes scale-up
@keyframes scale-down-out
.animate-scale-up
.animate-scale-down-closing
```

#### Sistema de Galería de Imágenes (Nuevo)
**Fecha:** 5 de Octubre, 2025

**Base de Datos:**
- Nueva tabla: `producto_imagenes`
- Campos: id, producto_id, url, orden, es_principal, alt_text
- Índices para performance en consultas
- Triggers automáticos para updated_at
- Función para asegurar solo una imagen principal
- RLS policies (públicas para lectura, admin para escritura)
- Funciones auxiliares: get_producto_imagenes(), get_producto_imagen_principal()
- Migración automática de imágenes existentes

**Frontend - ProductGallery.tsx:**
- Vista de galería con imagen principal grande
- Grid de thumbnails navegables (4-6 columnas responsive)
- Flechas de navegación izquierda/derecha
- Contador de imágenes (ej: 3 / 5)
- Zoom al hover en desktop (escala 150%, sigue el mouse)
- Modal fullscreen con fondo negro
- Navegación con teclado (flechas, Escape)
- Swipe gestures para mobile (touch events)
- Indicador visual de imagen principal (punto dorado)
- Transiciones suaves entre imágenes
- Fallback a imagen principal del producto

**Admin - ProductImageManager.tsx:**
- Upload múltiple de imágenes
- Preview en grid responsive
- Botones de reordenamiento (↑ ↓)
- Marcar/desmarcar como principal
- Eliminación con confirmación
- Badge visual para imagen principal
- Contador de imágenes en header
- Indicadores de posición (1, 2, 3...)
- Tooltips y ayuda contextual
- Loading states durante subida
- Integrado en modal de edición de AdminProducts

**Características técnicas:**
- Imágenes servidas desde Cloudinary
- Orden personalizable (campo `orden`)
- Solo una imagen principal por producto (trigger SQL)
- Carga optimizada con Supabase queries
- Responsive: grid adapta columnas según viewport
- Accesibilidad: alt texts, navegación por teclado
- Dark mode compatible en admin

---

**¿Listo para empezar? 🚀**

Selecciona una tarea, márcala como "En Progreso" y ¡a codear!
