# 🧪 Guía de Testing - Post Migración

**Estado:** Migración 100% completada  
**Objetivo:** Validar que todas las funciones migradas funcionan correctamente

---

## ✅ Checklist de Testing

### 1. 🛍️ Flujo Completo de Compra (PRIORITARIO)

**Objetivo:** Validar que un usuario puede comprar exitosamente

#### Paso a Paso:

- [ ] **1.1. Navegar al catálogo**
  - URL: https://mercadillo.app/catalogo
  - Verificar que se cargan productos
  - Función usada: `products`

- [ ] **1.2. Ver detalle de producto**
  - Click en un producto
  - Verificar imágenes, precio, opciones
  - Función usada: `products`

- [ ] **1.3. Agregar al carrito**
  - Seleccionar opciones/variantes
  - Agregar al carrito
  - Verificar contador del carrito

- [ ] **1.4. Ir al checkout**
  - URL: https://mercadillo.app/checkout
  - Iniciar sesión si es necesario
  - Completar datos de envío
  - Aplicar cupón (opcional)

- [ ] **1.5. Crear pedido pendiente**
  - Click en "Proceder al pago"
  - Verificar que se crea orden pendiente
  - Función usada: `checkout`
  - **Log esperado en Supabase:** Inserción en tabla `pedidos`

- [ ] **1.6. Crear preferencia de MercadoPago**
  - Redirección a MercadoPago
  - Función usada: `mercadopago-preference`
  - **Log esperado:** Preference ID generado

- [ ] **1.7. Completar pago**
  - Realizar pago de prueba en MercadoPago
  - Usar tarjeta de prueba si está en sandbox

- [ ] **1.8. Webhook procesa pago**
  - MercadoPago envía notificación
  - Función usada: `mercadopago-webhook`
  - **Log esperado:** 
    - Payment approved
    - Order status → "completado"

- [ ] **1.9. Email de confirmación**
  - Verificar recepción de email
  - Función usada: `emails`
  - **Revisar:** Inbox o spam

- [ ] **1.10. Historial de pedidos**
  - URL: https://mercadillo.app/perfil/pedidos
  - Verificar que aparece el pedido
  - Función usada: `orders`

**Si todos los pasos funcionan:** ✅ Flujo de compra OK

---

### 2. 🤖 Chat con IA (Gemini)

**Objetivo:** Validar asistente virtual

#### Pruebas:

- [ ] **2.1. Consulta general**
  ```
  Usuario: "Hola, ¿qué productos venden?"
  Esperado: Respuesta con categorías (Electrónicos, Ropa, Hogar, etc.)
  ```
  - Función usada: `chat`

- [ ] **2.2. Búsqueda de productos**
  ```
  Usuario: "Busca laptops"
  Esperado: Respuesta + lista de productos laptops
  ```
  - Función usada: `chat` + búsqueda en BD
  - **Verificar:** Campo `products` en respuesta

- [ ] **2.3. Información de envíos**
  ```
  Usuario: "¿Hacen envíos a todo Lima?"
  Esperado: Respuesta con info de envíos + URL completa
  ```
  - Verificar menciona: https://mercadillo.app/envios

- [ ] **2.4. Historial conversacional**
  ```
  Usuario 1: "Hola"
  Usuario 2: "¿Qué categorías tienen?"
  Usuario 3: "Muéstrame productos de Electrónicos"
  Esperado: Mantiene contexto entre mensajes
  ```

- [ ] **2.5. Conversación guardada**
  - Revisar tabla `chat_conversations` en Supabase
  - **Verificar:** Mensajes y respuestas guardadas

**Si todas las pruebas pasan:** ✅ Chat con IA OK

---

### 3. 👨‍💼 Panel Admin

**Objetivo:** Validar funciones administrativas

#### Pruebas:

- [ ] **3.1. Estadísticas**
  - URL: https://mercadillo.app/admin
  - Login con cuenta admin
  - Verificar dashboard carga
  - Función usada: `admin?action=stats`

- [ ] **3.2. Lista de pedidos**
  - Ver todos los pedidos
  - Función usada: `admin?action=orders`
  - **Verificar:** Pedido de prueba aparece

- [ ] **3.3. Ventas**
  - Ver reporte de ventas
  - Función usada: `admin?action=sales`

- [ ] **3.4. Top productos**
  - Ver productos más vendidos
  - Función usada: `admin?action=top-products`

**Si todas las pruebas pasan:** ✅ Panel Admin OK

---

### 4. 📧 Emails (Manual)

**Objetivo:** Validar envío de emails

#### Pruebas:

- [ ] **4.1. Email de confirmación**
  - Ya validado en flujo de compra (#1.9)
  - **Verificar:** 
    - Email recibido
    - Formato correcto
    - Datos del pedido correctos

- [ ] **4.2. Email de bienvenida (opcional)**
  - Registrar nuevo usuario
  - **Verificar:** Email de bienvenida

- [ ] **4.3. Email de envío (opcional)**
  - Marcar pedido como "enviado" desde admin
  - **Verificar:** Email de tracking

**Si emails llegan:** ✅ Sistema de emails OK

---

## 🔍 Monitoreo en Supabase Dashboard

### Revisar Logs de Funciones

**URL:** https://supabase.com/dashboard/project/xwubnuokmfghtyyfpgtl/functions

Para cada función, verificar:

#### ✅ Función `products`
- [ ] Sin errores en logs
- [ ] Tiempo de respuesta < 1s
- [ ] Datos retornados correctos

#### ✅ Función `orders`
- [ ] Creación de pedidos exitosa
- [ ] GET retorna pedidos del usuario
- [ ] Sin errores de permisos

#### ✅ Función `checkout`
- [ ] Calcula IGV correctamente (18%)
- [ ] Aplica descuentos de cupones
- [ ] Crea pedido con estado "pendiente"

#### ✅ Función `emails`
- [ ] Llamadas a Resend API exitosas
- [ ] Sin errores de autenticación
- [ ] Templates HTML correctos

#### ✅ Función `mercadopago-preference`
- [ ] Preference ID generado
- [ ] External reference codificado correctamente
- [ ] init_point retornado

#### ✅ Función `mercadopago-webhook`
- [ ] Recibe notificaciones de MercadoPago
- [ ] Actualiza estado de pedidos
- [ ] Registra uso de cupones
- [ ] Dispara email de confirmación

#### ✅ Función `chat`
- [ ] Respuestas de Gemini recibidas
- [ ] Búsqueda de productos funciona
- [ ] Conversaciones guardadas en BD
- [ ] Manejo de rate limits (429)

#### ✅ Función `admin`
- [ ] Requiere x-admin-secret
- [ ] Todas las acciones funcionan
- [ ] Stats correctas

---

## 📊 Métricas a Monitorear

### Durante la Primera Semana

Revisar diariamente en Supabase Dashboard:

| Métrica | Valor Objetivo | Acción si falla |
|---------|----------------|-----------------|
| **Tasa de éxito** | > 99% | Revisar logs de errores |
| **Tiempo respuesta promedio** | < 2s | Optimizar queries |
| **Errores/día** | < 10 | Investigar causa raíz |
| **Invocaciones/día** | < 15K | Estás dentro del límite |
| **Rate limits (429)** | 0 | Ajustar frecuencia |

### Alertas a Configurar (Opcional)

En Supabase Dashboard > Settings > Functions:

- [ ] Email si tasa de error > 5%
- [ ] Email si tiempo respuesta > 5s
- [ ] Email si uso mensual > 400K invocaciones

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error "Missing apikey"
**Causa:** Frontend no envía SUPABASE_ANON_KEY  
**Solución:** Verificar `src/config/api.ts` - `getApiHeaders()`

#### 2. Error "Forbidden" en admin
**Causa:** x-admin-secret incorrecto  
**Solución:** Verificar secret en Supabase = `mercadillo_admin_2025_secret_key`

#### 3. Email no llega
**Causa:** RESEND_API_KEY inválido o email en spam  
**Solución:** 
- Verificar secret en Supabase
- Revisar carpeta spam
- Verificar logs de función `emails`

#### 4. MercadoPago no confirma pago
**Causa:** Webhook URL no configurada  
**Solución:** 
- Ir a MercadoPago Dashboard
- Configurar webhook: `https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/mercadopago-webhook`

#### 5. Chat no responde
**Causa:** GEMINI_API_KEY inválido o rate limit  
**Solución:**
- Verificar key en Supabase
- Revisar logs para error 429
- Esperar unos segundos y reintentar

#### 6. Productos no cargan
**Causa:** Error en query o tabla vacía  
**Solución:**
- Verificar tabla `productos` tiene datos
- Revisar logs de función `products`

---

## ✅ Criterios de Éxito

### La migración es exitosa si:

- [x] ✅ 8/8 funciones desplegadas
- [ ] ✅ Flujo de compra completo funciona
- [ ] ✅ Emails se envían correctamente
- [ ] ✅ Chat responde consultas
- [ ] ✅ Panel admin accesible
- [ ] ✅ Sin errores en logs (< 1% tasa error)
- [ ] ✅ Tiempos de respuesta aceptables (< 2s)

### Validación Final:

- [ ] **Día 1-3:** Testing intensivo de todas las funciones
- [ ] **Día 4-7:** Monitoreo pasivo de logs
- [ ] **Día 8-14:** Validación de métricas semanales

**Si todo OK después de 14 días:** Proceder con cleanup de archivos Vercel

---

## 📞 Siguiente Acción

1. **AHORA:** Ejecutar checklist de testing completo
2. **Hoy:** Revisar logs en Supabase Dashboard
3. **Esta semana:** Monitorear métricas diarias
4. **Próxima semana:** Validar todo estable
5. **Después:** Limpiar archivos de Vercel

---

## 🎯 Resumen de URLs Importantes

### Producción
- **App:** https://mercadillo.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xwubnuokmfghtyyfpgtl
- **Functions URL:** https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/

### Testing
- **Catálogo:** https://mercadillo.app/catalogo
- **Checkout:** https://mercadillo.app/checkout
- **Admin:** https://mercadillo.app/admin
- **Perfil:** https://mercadillo.app/perfil/pedidos

---

**Próximo paso:** Ejecutar el checklist de testing y marcar cada item como completado ✅

¡Buena suerte con las pruebas! 🚀
