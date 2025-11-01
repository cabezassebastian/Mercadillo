# 🎯 Testing de Edge Functions

## 🧪 Pruebas Locales

### 1. Iniciar funciones localmente

```powershell
.\test-functions-local.ps1
```

Las funciones estarán en:
- Products: `http://localhost:54321/functions/v1/products/{id}`
- Orders: `http://localhost:54321/functions/v1/orders`
- Admin: `http://localhost:54321/functions/v1/admin?action=stats`

---

## 📡 Pruebas con cURL

### Products Function

```powershell
# GET Product by ID
curl -X GET "http://localhost:54321/functions/v1/products/1" `
  -H "apikey: tu_anon_key"
```

### Orders Function

```powershell
# GET Orders
curl -X GET "http://localhost:54321/functions/v1/orders" `
  -H "apikey: tu_anon_key" `
  -H "x-user-id: user_123"

# POST Create Order
curl -X POST "http://localhost:54321/functions/v1/orders" `
  -H "apikey: tu_anon_key" `
  -H "x-user-id: user_123" `
  -H "Content-Type: application/json" `
  -d '{
    "items": [{"id": "1", "cantidad": 2, "precio_unitario": 100}],
    "subtotal": 200,
    "igv": 36,
    "total": 236,
    "direccion": "Lima, Perú",
    "metodo_pago": "mercadopago"
  }'
```

### Admin Function

```powershell
# GET Stats
curl -X GET "http://localhost:54321/functions/v1/admin?action=stats" `
  -H "apikey: tu_anon_key" `
  -H "x-admin-secret: test_secret_local"

# GET Top Products
curl -X GET "http://localhost:54321/functions/v1/admin?action=top-products&limit=5" `
  -H "apikey: tu_anon_key" `
  -H "x-admin-secret: test_secret_local"

# GET Sales
curl -X GET "http://localhost:54321/functions/v1/admin?action=sales&period=month" `
  -H "apikey: tu_anon_key" `
  -H "x-admin-secret: test_secret_local"
```

---

## 🌐 Pruebas en Producción

Reemplaza `localhost:54321` con `xwubnuokmfghtyyfpgtl.supabase.co`:

```powershell
# GET Product
curl -X GET "https://xwubnuokmfghtyyfpgtl.supabase.co/functions/v1/products/1" `
  -H "apikey: $env:VITE_SUPABASE_ANON_KEY"
```

---

## 🔍 Ver Logs

### Logs Locales
Los logs aparecerán en la terminal donde ejecutaste `supabase functions serve`

### Logs en Producción
1. Ve al dashboard de Supabase
2. Settings > Edge Functions
3. Selecciona la función
4. Click en "Logs"

---

## ✅ Checklist de Testing

- [ ] Products function responde correctamente
- [ ] Orders GET retorna pedidos del usuario
- [ ] Orders POST crea pedidos correctamente
- [ ] Admin functions requieren x-admin-secret
- [ ] CORS funciona desde el frontend
- [ ] Errores retornan mensajes apropiados
- [ ] Headers se manejan correctamente

---

## 🐛 Debugging

### Error: "Missing apikey"
Agregar header: `-H "apikey: tu_anon_key"`

### Error: "Forbidden" 
Para funciones admin, agregar: `-H "x-admin-secret: tu_secret"`

### Error: "Unauthorized"
Para orders/checkout, agregar: `-H "x-user-id: user_id"`

### Function no responde
Verificar logs en el dashboard o en la terminal local
