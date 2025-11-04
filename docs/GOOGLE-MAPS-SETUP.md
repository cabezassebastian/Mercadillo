# Configuración de Google Maps API

Este documento explica cómo obtener y configurar la API Key de Google Maps para el selector de ubicaciones interactivo.

## 📋 Requisitos

- Cuenta de Google (Gmail)
- Tarjeta de crédito/débito (para verificación, Google ofrece $200 USD gratis al mes)

## 🔑 Paso 1: Obtener API Key

### 1.1 Ir a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google

### 1.2 Crear un Proyecto

1. Haz clic en el selector de proyectos (arriba a la izquierda)
2. Clic en "NUEVO PROYECTO"
3. Nombre: `Mercadillo` (o el que prefieras)
4. Haz clic en "CREAR"

### 1.3 Habilitar APIs Necesarias

1. En el menú lateral, ve a **APIs y servicios > Biblioteca**
2. Busca y habilita las siguientes APIs:
   - ✅ **Maps JavaScript API** (obligatoria)
   - ✅ **Geocoding API** (obligatoria para convertir coordenadas en direcciones)
   - ✅ **Places API** (opcional, para búsqueda de lugares)

Para cada una:
- Haz clic en la API
- Presiona el botón "HABILITAR"

### 1.4 Crear API Key

1. Ve a **APIs y servicios > Credenciales**
2. Haz clic en "+ CREAR CREDENCIALES"
3. Selecciona "Clave de API"
4. Copia la API Key generada

## 🔒 Paso 2: Restringir la API Key (Importante para Seguridad)

### 2.1 Restricciones de Aplicación

1. En la página de credenciales, haz clic en tu API Key
2. En "Restricciones de aplicación", selecciona **Referentes HTTP (sitios web)**
3. Agrega tus dominios:
   ```
   http://localhost:5173/*
   https://mercadillo.app/*
   https://*.mercadillo.app/*
   ```

### 2.2 Restricciones de API

En "Restricciones de API", selecciona **Restringir clave**

Marca solo las APIs que habilitaste:
- ✅ Maps JavaScript API
- ✅ Geocoding API
- ✅ Places API (si la habilitaste)

Haz clic en "GUARDAR"

## 🔧 Paso 3: Configurar en el Proyecto

### 3.1 Agregar API Key al archivo `.env.local`

```bash
# En la raíz del proyecto
VITE_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

**IMPORTANTE**: Nunca subas este archivo a Git. Ya está en `.gitignore`.

### 3.2 Reiniciar el servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C) y reiniciar
pnpm dev
```

## 💰 Costos y Límites

### Nivel Gratuito de Google Maps

Google ofrece **$200 USD de crédito gratis cada mes**, que equivale a:

- **Maps JavaScript API**: ~28,500 cargas de mapa por mes gratis
- **Geocoding API**: ~40,000 solicitudes por mes gratis

Para un e-commerce pequeño/mediano, esto es más que suficiente.

### Monitoreo de Uso

1. Ve a Google Cloud Console
2. **APIs y servicios > Panel de control**
3. Revisa el uso de cada API

### Configurar Alertas de Presupuesto

1. Ve a **Facturación > Presupuestos y alertas**
2. Crea un presupuesto (ej: $5 USD al mes)
3. Configura alertas al 50%, 90% y 100%

## 🧪 Verificar que Funciona

1. Ve a tu aplicación en desarrollo: `http://localhost:5173`
2. Navega a Perfil → Direcciones → Agregar dirección
3. Haz clic en "Seleccionar ubicación en el mapa"
4. Deberías ver un mapa interactivo con un pin rojo

Si ves el mapa, ¡funciona! 🎉

## ❌ Problemas Comunes

### Error: "This page can't load Google Maps correctly"

**Solución**: 
- Verifica que la API Key esté correctamente en `.env.local`
- Asegúrate de haber habilitado **Maps JavaScript API**
- Revisa las restricciones de dominio

### Error: "Geocoding Service returned error"

**Solución**:
- Habilita **Geocoding API** en Google Cloud Console

### El mapa no aparece

**Solución**:
- Reinicia el servidor de desarrollo (`pnpm dev`)
- Abre la consola del navegador (F12) para ver errores
- Verifica que la API Key comience con `AIza...`

## 📝 Notas Adicionales

- La API Key es solo para frontend (VITE_*)
- Las restricciones de dominio protegen contra uso no autorizado
- Puedes revocar y crear nuevas API Keys en cualquier momento
- El crédito de $200/mes se renueva automáticamente

## 🔗 Enlaces Útiles

- [Google Maps Platform](https://developers.google.com/maps)
- [Documentación Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Calculadora de Precios](https://mapsplatform.google.com/pricing/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**¿Necesitas ayuda?** Consulta la documentación oficial de Google Maps Platform o contacta al equipo de desarrollo.
