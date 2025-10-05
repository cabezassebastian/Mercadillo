# 📧 Sistema de Emails Transaccionales con Resend

Sistema completo de notificaciones por email usando **Resend** y **Vercel Serverless Functions** para mantener informados a los clientes sobre el estado de sus pedidos y darles la bienvenida a la plataforma.

> **Última actualización:** Octubre 4, 2025  
> **Estado:** ✅ Funcionando (emails van a spam, DMARC configurado - en propagación)

---

## 📋 Índice

1. [Características](#-características)
2. [Configuración](#-configuración)
3. [Tipos de Emails](#-tipos-de-emails)
4. [Arquitectura Serverless](#-arquitectura-serverless)
5. [Archivos del Sistema](#-archivos-del-sistema)
6. [Uso](#-uso)
7. [Deliverability (DMARC)](#-deliverability-dmarc)
8. [Testing](#-testing)
9. [Troubleshooting](#-troubleshooting)

---

## ✨ Características

- ✅ **4 tipos de emails transaccionales**
- ✅ **Serverless Functions** en Vercel (no CORS, no problemas de browser)
- ✅ **Plantillas HTML simples** con estilos inline (no React Email components)
- ✅ **Colores de Mercadillo** (#FFD700, #b8860b, #333333)
- ✅ **Email de bienvenida** para nuevos usuarios (sin cupón)
- ✅ **DMARC configurado** para evitar spam (propagando DNS)
- ✅ **Manejo de errores** robusto (no falla el flujo principal)
- ✅ **100% TypeScript** con tipos estrictos

---

## ⚙️ Configuración

### 1. Cuenta en Resend

**Configuración actual:**
- ✅ Cuenta creada: `cabezassebastian08@gmail.com`
- ✅ Dominio verificado: `mercadillo.app`
- ✅ DNS configurado: MX, SPF, DKIM ✅
- ⏳ **DMARC**: Configurado, esperando propagación DNS (24-48h)
- ✅ API Key: Configurada en Vercel y `.env.local`
- ✅ Sender: `pedidos@mercadillo.app`

### 2. Variables de Entorno

**En `.env.local` (desarrollo):**
```env
VITE_RESEND_API_KEY=re_FNiQkHW1_MhdZCehba257wyBusis2tBGj
VITE_APP_URL=http://localhost:5173
```

**En Vercel (producción):**
- ✅ `VITE_RESEND_API_KEY` configurada
- ✅ `VITE_APP_URL=https://mercadillo.app`

### 3. Configuración DNS (Name.com)

**Registros configurados:**

```dns
# MX Record (Mail Exchange)
@ MX 10 feedback-smtp.us-east-1.amazonses.com

# SPF (Sender Policy Framework)
@ TXT "v=spf1 include:amazonses.com ~all"

# DKIM (DomainKeys Identified Mail)
resend._domainkey TXT "p=MIGfMA0GCSqGSIb3DQEBAQUAA4..."

# DMARC (Domain-based Message Authentication) ⭐ NUEVO
_dmarc TXT "v=DMARC1; p=none; rua=mailto:contactomercadillo@gmail.com"
```

**Estado DMARC:**
- ✅ Registro agregado: Octubre 4, 2025
- ⏳ Propagación: 24-48 horas
- 📋 Policy: `p=none` (monitoreo inicial)
- 🔄 Próximo paso: Cambiar a `p=quarantine` después de 1-2 semanas

---

## 📨 Tipos de Emails

### 1. 👋 Email de Bienvenida

**Cuándo se envía:** Al crear un nuevo usuario (automático vía `AuthSync`)

**Contenido:**
- Mensaje de bienvenida personalizado con nombre
- Características de la plataforma
- ~~Cupón de bienvenida~~ (Eliminado por decisión del negocio)
- Link al catálogo: `/catalogo`
- Colores de Mercadillo (#FFD700, #b8860b)

**Endpoint:** `POST /api/emails/send-welcome`

**Payload:**
```typescript
{
  nombre: string  // Nombre del usuario
  email: string   // Email destino
}
```

**Plantilla:** Simple HTML string (no React components)

---

### 2. ✅ Confirmación de Pedido

**Cuándo se envía:** Automáticamente después de pago exitoso en MercadoPago

**Contenido:**
- Agradecimiento personalizado
- Número de pedido
- Resumen de productos con imágenes
- Subtotal, descuento, total
- Dirección de envío
- Próximos pasos

**Endpoint:** `POST /api/emails/send-order-confirmation`

**Payload:**
```typescript
{
  email: string
  nombre: string
  pedido: {
    id: string
    total: number
    subtotal: number
    // ...
  }
  items: Array<{
    nombre: string
    cantidad: number
    precio: number
    imagen: string
  }>
  direccion: {
    calle: string
    ciudad: string
    // ...
  }
}
```

---

### 3. 📦 Notificación de Envío

**Cuándo se envía:** Cuando admin marca como "Enviado"

**Contenido:**
- Confirmación de envío
- Número de pedido
- Fecha de envío
- Número de seguimiento (opcional)
- Timeline de entrega
- Estimado: 2-5 días

**Endpoint:** `POST /api/emails/send-shipping`

---

### 4. 🎉 Confirmación de Entrega

**Cuándo se envía:** Cuando admin marca como "Entregado"

**Contenido:**
- Celebración de entrega exitosa
- Número de pedido
- Fecha de entrega
- Solicitud de reseña
- Soporte (48h para reportar problemas)

**Endpoint:** `POST /api/emails/send-delivery`

---

## 🏗️ Arquitectura Serverless

### ¿Por qué Serverless Functions?

**Problema original:** Llamar a Resend API desde el navegador causaba errores CORS:
```
Access to fetch at 'https://api.resend.com/emails' has been blocked by CORS policy
```

**Solución:** Serverless functions en Vercel que actúan como proxy:

```
Browser → Vercel Function → Resend API → Email enviado
         (sin CORS)      (API call permitido)
```

### Estructura de Funciones

```
api/
└── emails/
    ├── send-welcome.ts              # Email de bienvenida
    ├── send-order-confirmation.ts   # Confirmación de pedido
    ├── send-shipping.ts             # Notificación de envío
    └── send-delivery.ts             # Confirmación de entrega
```

### Ejemplo de Función Serverless

```typescript
// api/emails/send-welcome.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.VITE_RESEND_API_KEY)

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { nombre, email } = req.body

  // Plantilla HTML simple (sin React)
  const html = getWelcomeEmailHTML(nombre)

  try {
    const data = await resend.emails.send({
      from: 'Mercadillo <pedidos@mercadillo.app>',
      to: [email],
      subject: '¡Bienvenido a Mercadillo! 🎉',
      html
    })

    return res.status(200).json({ success: true, id: data.id })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
```

### Plantillas HTML

**Antes (problema):**
```typescript
// ❌ No funciona en Vercel serverless
import { WelcomeEmail } from '../../src/templates/emails/Welcome'
html: await render(WelcomeEmail({ nombre }))
```

**Ahora (funciona):**
```typescript
// ✅ HTML string directo
const getWelcomeEmailHTML = (nombre: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { 
      background: linear-gradient(135deg, #FFD700 0%, #b8860b 100%);
      padding: 40px;
      text-align: center;
    }
    h1 { color: #333333; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 ¡Bienvenido a Mercadillo!</h1>
  </div>
  <div style="padding: 40px;">
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Gracias por unirte a nuestra comunidad.</p>
    <a href="${process.env.VITE_APP_URL}/catalogo">Ver Catálogo</a>
  </div>
</body>
</html>
`
```

---

## 🔄 Flujo de Trabajo

### Confirmación de Pedido

```
Usuario paga → MercadoPago webhook → 
Crear pedido en BD → 
Enviar email de confirmación → 
Usuario recibe email
```

**Código:**
```typescript
// api/mercadopago/webhook.ts
if (paymentInfo.status === 'approved' && order) {
  const { data: userData } = await supabase
    .from('usuarios')
    .select('email, nombre_completo')
    .eq('usuario_id', order.usuario_id)
    .single()

  await enviarEmailConfirmacionPedido({
    email: userData.email,
    nombre: userData.nombre_completo,
    pedido: { ... },
    items: [ ... ],
    direccion: { ... }
  })
}
```

---

### Notificación de Envío

```
Admin abre pedido → 
Clic en "Marcar como Enviado" → 
Actualizar BD (estado, fecha_envio) → 
Enviar email → 
Usuario recibe notificación
```

**Código:**
```typescript
// src/components/Admin/AdminOrders.tsx
const handleMarcarComoEnviado = async (pedido) => {
  await supabaseAdmin
    .from('pedidos')
    .update({ 
      estado: 'enviado',
      fecha_envio: new Date().toISOString()
    })
    .eq('id', pedido.id)

  await enviarEmailEnvio({
    email: userData.email,
    nombre: userData.nombre_completo,
    numero_pedido: pedido.id,
    fecha_envio: new Date().toISOString(),
    items: [ ... ]
  })
}
```

---

### Confirmación de Entrega

```
Admin abre pedido → 
Clic en "Marcar como Entregado" → 
Actualizar BD (estado, fecha_entrega) → 
Enviar email → 
Usuario recibe confirmación + solicitud de reseña
```

**Código:**
```typescript
// src/components/Admin/AdminOrders.tsx
const handleMarcarComoEntregado = async (pedido) => {
  await supabaseAdmin
    .from('pedidos')
    .update({ 
      estado: 'entregado',
      fecha_entrega: new Date().toISOString()
    })
    .eq('id', pedido.id)

  await enviarEmailEntrega({
    email: userData.email,
    nombre: userData.nombre_completo,
    numero_pedido: pedido.id,
    fecha_entrega: new Date().toISOString(),
    items: [ ... ]
  })
}
```

---

### Email de Bienvenida

```
Usuario se registra → 
Crear perfil en BD → 
Enviar email de bienvenida → 
Usuario recibe cupón BIENVENIDA10
```

**Código:**
```typescript
// src/lib/userProfile.ts
export async function createUserProfile(userId, userData) {
  await supabase
    .from('usuarios')
    .insert([{ usuario_id: userId, ...userData }])

  await enviarEmailBienvenida({
    email: userData.email,
    nombre: userData.nombre_completo
  })
}
```

---

## 📁 Archivos del Sistema

### Serverless Functions (API Routes)
```
api/
└── emails/
    ├── send-welcome.ts              # Email de bienvenida
    ├── send-order-confirmation.ts   # Confirmación de pedido  
    ├── send-shipping.ts             # Notificación de envío
    └── send-delivery.ts             # Confirmación de entrega
```

### Integraciones Frontend
```
src/
├── components/
│   ├── AuthSync.tsx                 # Envía email de bienvenida
│   └── Admin/
│       └── AdminOrders.tsx          # Botones envío/entrega
└── lib/
    └── userProfile.ts               # Llama a send-welcome
```

### Configuración
```
.env.local                           # API keys (no en git)
env.local.example                    # Template sin valores
vercel.json                          # Config de serverless functions
```

---

## 🚀 Uso

### 1. Email de Bienvenida (Automático)

Se envía automáticamente cuando se crea un nuevo usuario:

```typescript
// src/lib/userProfile.ts
export async function createUserProfile(userId: string, userData: any) {
  // 1. Crear usuario en Supabase
  await supabase.from('usuarios').insert([...])

  // 2. Enviar email de bienvenida
  try {
    await fetch('/api/emails/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: userData.nombre,
        email: userData.email
      })
    })
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}
```

**Trigger:** AuthSync detecta nuevo usuario → crea perfil → envía email

---

### 2. Email de Confirmación (Automático)

Se envía desde el webhook de MercadoPago:

```typescript
// api/mercadopago/webhook.ts
if (payment.status === 'approved') {
  await fetch('/api/emails/send-order-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userData.email,
      nombre: userData.nombre,
      pedido: { ... },
      items: [ ... ],
      direccion: { ... }
    })
  })
}
```

**Trigger:** Pago aprobado → crear pedido → enviar email

---

### 3. Email de Envío (Manual - Admin)

1. Ir a `/admin/pedidos`
2. Abrir pedido (ícono de ojo)
3. Clic en **"Marcar como Enviado"**
4. ✅ Email se envía automáticamente

---

### 4. Email de Entrega (Manual - Admin)

1. Ir a `/admin/pedidos`
2. Abrir pedido
3. Clic en **"Marcar como Entregado"**
4. ✅ Email se envía automáticamente

---

## 📬 Deliverability (DMARC)

### ¿Por qué los emails van a spam?

Causas comunes:
1. **Dominio nuevo** sin reputación de envío
2. **Falta DMARC** (ya configurado ✅)
3. **Bajo volumen** de envíos (domain warming necesario)

### Configuración DMARC (Completada)

**Registro agregado en Name.com:**
```dns
Host: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:contactomercadillo@gmail.com
TTL: 3600
```

**Significado:**
- `p=none` - Política inicial: solo monitorea, no bloquea
- `rua=mailto:...` - Reportes diarios de autenticación

**Estado:**
- ✅ Registro agregado: Octubre 4, 2025
- ⏳ Propagación DNS: 24-48 horas
- 📋 Monitoreo: 1-2 semanas
- 🔄 Siguiente paso: Cambiar a `p=quarantine`

### Verificar Propagación DMARC

```powershell
# En PowerShell
nslookup -type=TXT _dmarc.mercadillo.app

# Deberías ver:
# v=DMARC1; p=none; rua=mailto:contactomercadillo@gmail.com
```

### Domain Warming Strategy

**Semana 1-2:**
- Enviar 5-10 emails/día
- Solo a usuarios reales que interactuaron
- Monitorear reportes DMARC

**Semana 3-4:**
- Aumentar a 20-30 emails/día
- Revisar tasa de apertura (>15% es bueno)
- Cambiar DMARC a `p=quarantine`

**Mes 2+:**
- Envíos normales (sin límite específico)
- DMARC en `p=quarantine` o `p=reject`
- Emails llegan a inbox ✅

### Verificar Entregabilidad

Herramientas útiles:
- https://www.mail-tester.com/ (envía email y te da score /10)
- https://mxtoolbox.com/dmarc.aspx (verifica DMARC)
- Resend Dashboard → Email Logs (ver bounces/spam reports)

---

## 🧪 Testing

### Testing Local

```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. Probar email de bienvenida
# Registra un nuevo usuario en /sign-up
# Verifica consola del servidor para ver logs

# 3. Ver email en Resend Dashboard
# https://resend.com/emails
```

### Testing en Producción

**Email de Bienvenida:**
1. Crear usuario nuevo en producción
2. Verificar inbox
3. Revisar Resend Dashboard

**Email de Confirmación:**
1. Hacer compra de prueba con MercadoPago
2. Verificar email después del pago
3. Revisar formato y links

**Emails de Envío/Entrega:**
1. Login como admin en producción
2. Ir a `/admin/pedidos`
3. Marcar pedido como enviado/entregado
4. Verificar email recibido

### Verificar Logs

**En Vercel:**
```
Dashboard → Mercadillo → Logs → Filter: "send-welcome"
```

**En Resend:**
```
Dashboard → Emails → Ver lista de emails enviados
```

---

## 🔧 Troubleshooting

### ❌ Error: "Method not allowed"

**Causa:** Request no es POST

**Solución:**
```typescript
await fetch('/api/emails/send-welcome', {
  method: 'POST',  // ← Asegúrate que sea POST
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre, email })
})
```

---

### ❌ Error: "Failed to send email"

**Posibles causas:**

1. **API Key incorrecta**
   - Verifica `VITE_RESEND_API_KEY` en Vercel
   - Debe empezar con `re_`

2. **Email inválido**
   - Verifica formato del email
   - No usar emails temporales

3. **Rate limit alcanzado**
   - Plan gratuito: 100 emails/día, 3,000/mes
   - Verifica uso en Resend Dashboard

**Solución:**
```typescript
// Ver logs en la función serverless
console.log('📧 Sending email to:', email)
console.log('✅ Email sent:', data.id)
console.error('❌ Error:', error)
```

---

### ❌ Email va a spam

**Causas:**
1. DMARC propagándose (esperar 24-48h)
2. Dominio sin reputación (hacer domain warming)
3. Contenido parece spam (evitar palabras como "GRATIS", "OFERTA")

**Soluciones:**
- ✅ DMARC configurado (propagando)
- ⏳ Domain warming (enviar poco a poco)
- 📝 Contenido profesional (evitar spammy words)
- 👥 Pedir a usuarios agregar `pedidos@mercadillo.app` a contactos

---

### ❌ Links en email no funcionan

**Causa:** Variable `VITE_APP_URL` incorrecta

**Solución:**
```env
# .env.local
VITE_APP_URL=http://localhost:5173

# Vercel (Production)
VITE_APP_URL=https://mercadillo.app
```

---

### ❌ Emails duplicados

**Causa:** Función llamada múltiples veces

**Solución:**
```typescript
// Agregar debouncing o flag
let emailSent = false

if (!emailSent) {
  await fetch('/api/emails/send-welcome', {...})
  emailSent = true
}
```

---

### ❌ HTML no renderiza correctamente

**Causa:** Cliente de email no soporta ciertos CSS

**Solución:**
- Usar estilos inline: `style="color: red;"`
- Evitar Flexbox/Grid (usar tables)
- Probar en https://www.emailonacid.com/

---

## 📊 Estadísticas y Monitoring

### Dashboard de Resend

**Métricas disponibles:**
- ✉️ Emails enviados
- ✅ Tasa de entrega (delivery rate)
- 📬 Bounces (emails rebotados)
- 🚫 Spam reports
- 📈 Aperturas (si habilitas tracking)

**URL:** https://resend.com/emails

### Reportes DMARC

Recibirás reportes diarios en `contactomercadillo@gmail.com`:

**Formato:**
```xml
<record>
  <source_ip>52.94.xxx.xxx</source_ip>
  <count>5</count>
  <policy_evaluated>
    <disposition>none</disposition>
    <dkim>pass</dkim>
    <spf>pass</spf>
  </policy_evaluated>
</record>
```

**Interpretar:**
- `dkim: pass` ✅ - Firma digital correcta
- `spf: pass` ✅ - Servidor autorizado
- `count: 5` - 5 emails autenticados correctamente

---

## 🔐 Seguridad

- ✅ API Key en variables de entorno (nunca en código)
- ✅ Validación de emails antes de enviar
- ✅ Rate limiting de Resend (protección contra abuse)
- ✅ Logs detallados en servidor (no exponer en cliente)
- ✅ HTTPS obligatorio (Vercel)
- ✅ DMARC para prevenir spoofing

---

## 📈 Próximas Mejoras

**Corto plazo:**
- [ ] Tracking de aperturas (Resend tracking pixels)
- [ ] Reportes semanales de emails enviados
- [ ] A/B testing de subject lines

**Mediano plazo:**
- [ ] Email de carrito abandonado
- [ ] Email de reseña post-compra (7 días después)
- [ ] Newsletter mensual

**Largo plazo:**
- [ ] Sistema de preferencias de email
- [ ] Unsubscribe automático
- [ ] Personalización basada en historial

---

## ✅ Checklist de Implementación

- [x] Instalación de Resend
- [x] Variables de entorno configuradas
- [x] Serverless functions creadas (`/api/emails/*`)
- [x] Plantillas HTML simples (no React)
- [x] Integración en AuthSync (bienvenida)
- [x] Integración en webhook MercadoPago (confirmación)
- [x] Botones en AdminOrders (envío/entrega)
- [x] DNS configurado (MX, SPF, DKIM)
- [x] DMARC configurado
- [ ] DMARC propagado (24-48h) ⏳
- [ ] Emails llegando a inbox (después de DMARC + warming) ⏳
- [x] Documentación actualizada

---

## 📞 Soporte

**Resend:**
- Docs: https://resend.com/docs
- Support: https://resend.com/support
- Status: https://status.resend.com/

**DMARC:**
- Verificar: https://mxtoolbox.com/dmarc.aspx
- Generator: https://dmarcian.com/dmarc-inspector/

**Email Testing:**
- Mail Tester: https://www.mail-tester.com/
- Email on Acid: https://www.emailonacid.com/

---

**Sistema implementado:** Octubre 4, 2025  
**Versión:** 2.0.0 (Serverless)  
**Stack:** Resend + Vercel Functions + TypeScript + HTML Templates  
**Estado:** ✅ Funcionando (DMARC propagando)
