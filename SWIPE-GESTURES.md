# Gestos Swipe - Documentación Técnica

## 📱 ¿Qué son los Gestos Swipe?

Los **gestos swipe** (deslizar) son interacciones táctiles en dispositivos móviles donde el usuario desliza el dedo horizontalmente o verticalmente sobre la pantalla. Son esenciales para una experiencia mobile intuitiva.

---

## 🎯 Implementación Actual

### 1. **Galería de Imágenes** ✅
**Ubicación:** `src/components/Product/ProductGallery.tsx`

**Funcionalidad:**
- **Swipe izquierda** (←): Siguiente imagen
- **Swipe derecha** (→): Imagen anterior
- **Threshold:** 50px mínimo de distancia
- **Visual feedback:** Transición suave entre imágenes

**Código:**
```typescript
// Swipe gestures para mobile
const handleTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null);
  setTouchStart(e.targetTouches[0].clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;

  if (isLeftSwipe) {
    handleNext(); // Siguiente imagen
  }
  if (isRightSwipe) {
    handlePrev(); // Imagen anterior
  }
};
```

**Integración en JSX:**
```typescript
<img
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  src={currentImage.url}
  alt={currentImage.alt_text || productName}
/>
```

---

## 🔧 Cómo Funcionan los Gestos Swipe

### 1. **touchStart** - Inicio del toque
```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null); // Reset del punto final
  setTouchStart(e.targetTouches[0].clientX); // Guardar posición X inicial
};
```
- Se ejecuta cuando el usuario toca la pantalla
- Guarda la posición **X inicial** (coordenada horizontal)
- Resetea el punto final para un nuevo gesto

### 2. **touchMove** - Movimiento del dedo
```typescript
const handleTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX); // Actualizar posición X actual
};
```
- Se ejecuta continuamente mientras el dedo se mueve
- Actualiza la posición **X actual**
- No ejecuta acciones, solo rastrea el movimiento

### 3. **touchEnd** - Fin del toque
```typescript
const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return; // Validar que existan ambos puntos
  
  const distance = touchStart - touchEnd; // Calcular distancia recorrida
  const isLeftSwipe = distance > 50;     // Swipe izquierda si distancia > 50px
  const isRightSwipe = distance < -50;   // Swipe derecha si distancia < -50px

  if (isLeftSwipe) handleNext();
  if (isRightSwipe) handlePrev();
};
```
- Se ejecuta cuando el usuario levanta el dedo
- Calcula la **distancia recorrida**: `touchStart - touchEnd`
- Determina la dirección y ejecuta la acción correspondiente

---

## 📐 Lógica de Detección

### Cálculo de Distancia
```typescript
const distance = touchStart - touchEnd;
```

| Movimiento | touchStart | touchEnd | distance | Resultado |
|-----------|-----------|---------|----------|-----------|
| Swipe izquierda ← | 300px | 200px | **+100px** | Positivo > 50 → `handleNext()` |
| Swipe derecha → | 200px | 300px | **-100px** | Negativo < -50 → `handlePrev()` |
| No swipe | 250px | 245px | **+5px** | No alcanza threshold |

### Threshold de 50px
```typescript
const isLeftSwipe = distance > 50;   // Mínimo 50px a la izquierda
const isRightSwipe = distance < -50; // Mínimo 50px a la derecha
```

**¿Por qué 50px?**
- Evita **falsos positivos** (toques accidentales)
- Balance entre **sensibilidad** y **precisión**
- Estándar en apps móviles modernas

---

## 🎨 UX/UI Considerations

### ✅ Buenas Prácticas Implementadas
1. **Visual Feedback:** Transición suave (200ms) entre imágenes
2. **Prevención de Scroll:** No interfiere con el scroll vertical
3. **Threshold Razonable:** 50px es cómodo para usuarios
4. **Estados Claros:** Indicadores visuales (thumbnails, contador)
5. **Navegación Híbrida:** Swipe + flechas + teclado

### ⚠️ Consideraciones Importantes
- **No bloquear scroll:** Solo detectar movimiento horizontal significativo
- **Reset state:** Limpiar touchEnd en cada touchStart
- **Validación:** Verificar que touchStart y touchEnd existan antes de calcular
- **Accesibilidad:** Siempre ofrecer alternativas (botones, teclado)

---

## 🚀 Próximas Implementaciones

### 2. **Menú Hamburguesa Mejorado** ⏳
**Funcionalidad planeada:**
- **Swipe izquierda** (←): Cerrar menú
- **Overlay click:** Cerrar menú
- **Animación:** Slide from left (250ms)

**Pseudocódigo:**
```typescript
const handleTouchEnd = () => {
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;

  if (isLeftSwipe) {
    closeMenuWithAnimation();
  }
};
```

### 3. **Carrito - Swipe para Eliminar** ⏳
**Funcionalidad planeada:**
- **Swipe derecha** (→): Mostrar botón "Eliminar"
- **Confirmación:** Tap en botón para confirmar
- **Swipe izquierda** (←): Cancelar y ocultar botón

**Ejemplo de otros apps:**
- iOS Mail: Swipe derecha para eliminar/archivar
- WhatsApp: Swipe para responder/eliminar mensaje
- Gmail: Swipe para archivar/eliminar

**Pseudocódigo:**
```typescript
const handleCartItemSwipe = () => {
  const distance = touchStart - touchEnd;
  const isRightSwipe = distance < -80; // Threshold mayor para evitar accidentes

  if (isRightSwipe) {
    setShowDeleteButton(true); // Mostrar botón eliminar
  }
};
```

---

## 📚 Recursos y Ejemplos

### Código Reutilizable (Hook Personalizado)
```typescript
// hooks/useSwipeGesture.ts
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
```

### Uso del Hook
```typescript
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(
  handleNext,  // Swipe izquierda
  handlePrev,  // Swipe derecha
  50           // Threshold
);

<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {/* Contenido */}
</div>
```

---

## 🧪 Testing

### Casos de Prueba
1. **Swipe válido izquierda:** distance > 50px → Siguiente imagen
2. **Swipe válido derecha:** distance < -50px → Imagen anterior
3. **Swipe corto:** |distance| < 50px → No hace nada
4. **Tap (sin movimiento):** touchEnd = null → No hace nada
5. **Scroll vertical:** No interfiere con scroll de página

### Devices Testeados
- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ iPad (Safari)
- ✅ Desktop (emulación táctil en DevTools)

---

## 📊 Métricas de Uso

### Analytics Sugeridos
```typescript
// Trackear uso de swipe vs otros métodos de navegación
analytics.track('image_navigation', {
  method: 'swipe', // 'swipe' | 'arrow' | 'keyboard' | 'thumbnail'
  direction: 'left', // 'left' | 'right'
  device_type: 'mobile'
});
```

---

## 🔗 Referencias

- [MDN - Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [React Touch Events](https://react.dev/reference/react-dom/components/common#touch-events)
- [Material Design - Gestures](https://m3.material.io/foundations/interaction/gestures)
- [iOS Human Interface Guidelines - Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures)

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Autor:** Mercadillo Team
