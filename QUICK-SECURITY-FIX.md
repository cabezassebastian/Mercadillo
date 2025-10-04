# 🔒 Guía Rápida: Hacer Repositorio Privado

## ⚡ Solución Inmediata (2 minutos)

Si no tienes tiempo para rotar claves, **haz el repositorio PRIVADO** en GitHub. Esto ocultará tu código y las claves del historial para todo el mundo excepto tú.

---

## 📋 Pasos para Hacer el Repo Privado

### 1. Ve a GitHub
- Abre: https://github.com/cabezassebastian/Mercadillo

### 2. Settings
- Click en **Settings** (engranaje, arriba a la derecha)

### 3. Cambiar Visibilidad
- Scroll hasta el final: **Danger Zone**
- Click en **Change repository visibility**
- Selecciona **Make private**
- Escribe el nombre del repo: `Mercadillo`
- Click en **I understand, change repository visibility**

### 4. ✅ LISTO
- Tu repositorio ahora es privado
- Nadie puede ver tu código ni el historial
- Tus claves están seguras

---

## 🎯 Ventajas

✅ **Inmediato** - Toma 2 minutos  
✅ **No rompe nada** - Vercel sigue funcionando  
✅ **No necesitas rotar claves** - Las claves actuales siguen funcionando  
✅ **Reversible** - Puedes hacerlo público después si quieres  

---

## ⚠️ Consideraciones

### Vercel seguirá funcionando
- ✅ Los deploys automáticos siguen activos
- ✅ No necesitas cambiar nada en Vercel
- ✅ Tu sitio sigue en: https://www.mercadillo.app

### Colaboradores
- ⚠️ Si alguien más trabaja en el proyecto, deberás invitarlo
- Ve a **Settings → Collaborators → Add people**

### GitHub Free
- ✅ Repositorios privados son GRATIS
- ✅ Sin límite de repositorios privados
- ✅ Todas las funciones disponibles

---

## 🔐 Seguridad a Largo Plazo

Aunque el repo sea privado, es **buena práctica** eventualmente:

1. **Rotar claves de producción** (cuando tengas tiempo)
   - Especialmente: MercadoPago, Supabase Service Role
   
2. **Mantener el repo privado** para proyectos comerciales
   
3. **Configurar GitHub Secret Scanning**
   - Settings → Security → Secret scanning
   - GitHub te alertará si detecta claves expuestas

---

## 🚀 Plan Sugerido

### HOY (2 minutos)
- [x] Hacer repositorio privado ← **HAZ ESTO AHORA**

### Esta Semana (cuando tengas tiempo)
- [ ] Rotar Clerk keys
- [ ] Rotar Supabase Service Role Key
- [ ] Rotar Gemini API Key

### Este Mes (opcional)
- [ ] Rotar MercadoPago keys
- [ ] Configurar 2FA en todas las plataformas

---

## ✅ Verificación

Después de hacer el repo privado:

1. Cierra sesión en GitHub
2. Intenta acceder a: https://github.com/cabezassebastian/Mercadillo
3. Deberías ver: **"404 - This is not the web page you are looking for"**
4. ✅ Si ves 404, tu repo está privado y seguro

---

**¿Necesitas hacerlo público de nuevo?**

Mismo proceso pero seleccionando "Make public" en Danger Zone.

---

**Tiempo total:** 2 minutos  
**Costo:** $0 (gratis)  
**Efectividad:** 🟢 Alta (para ocultar el código)

---

