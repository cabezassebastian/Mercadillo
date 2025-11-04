-- =====================================================
-- PRIMERO: Asegurarse que la columna google_maps_url existe
-- =====================================================
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

COMMENT ON COLUMN pedidos.google_maps_url IS 'URL de Google Maps de la dirección de entrega del pedido';


-- =====================================================
-- EJEMPLOS de INSERT de pedidos con ubicación de Google Maps
-- =====================================================

-- Ejemplo 1: Pedido con ubicación en San Isidro
INSERT INTO pedidos (
  id,
  usuario_id,
  items,
  subtotal,
  total, -- SIN IGV, solo total
  estado,
  direccion_envio,
  metodo_pago,
  google_maps_url,
  created_at
) VALUES (
  gen_random_uuid(),
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK', -- Reemplaza con un ID de usuario real
  '[
    {
      "id": "3dbe5a39-0b4e-427a-ae2e-69d6d117cf71",
      "nombre": "Producto Ejemplo 1",
      "precio": 25.50,
      "cantidad": 2,
      "imagen": "https://example.com/imagen1.jpg"
    },
    {
      "id": "cf7d4554-9454-4a27-93ac-bd98ec69bcd1",
      "nombre": "Producto Ejemplo 2",
      "precio": 15.00,
      "cantidad": 1,
      "imagen": "https://example.com/imagen2.jpg"
    }
  ]'::jsonb,
  66.00,  -- Subtotal (25.50 * 2 + 15.00)
  77.88,  -- Total con IGV incluido
  'pendiente',
  'Av. Javier Prado 1234, San Isidro, Lima',
  'mercadopago',
  'https://www.google.com/maps?q=-12.0896,-77.0353', -- ← Ubicación exacta en Google Maps
  NOW()
);

-- Ejemplo 2: Pedido con ubicación en Miraflores
INSERT INTO pedidos (
  id,
  usuario_id,
  items,
  subtotal,
  total,
  estado,
  direccion_envio,
  metodo_pago,
  google_maps_url,
  created_at
) VALUES (
  gen_random_uuid(),
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  '[
    {
      "id": "a1b2c3d4-1234-5678-90ab-cdef12345678",
      "nombre": "Producto Premium",
      "precio": 99.90,
      "cantidad": 1,
      "imagen": "https://example.com/premium.jpg"
    }
  ]'::jsonb,
  99.90,
  117.88,
  'pagado',
  'Calle Las Begonias 456, San Isidro, Lima 15073',
  'mercadopago',
  'https://www.google.com/maps?q=-12.0988,-77.0354', -- ← Kennedy Park, Miraflores
  NOW()
);

-- Ejemplo 3: Pedido SIN ubicación de Google Maps (campo NULL)
INSERT INTO pedidos (
  id,
  usuario_id,
  items,
  subtotal,
  total,
  estado,
  direccion_envio,
  metodo_pago,
  google_maps_url, -- ← NULL, usuario no seleccionó ubicación
  created_at
) VALUES (
  gen_random_uuid(),
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  '[
    {
      "id": "xyz789",
      "nombre": "Producto Simple",
      "precio": 45.00,
      "cantidad": 1,
      "imagen": "https://example.com/simple.jpg"
    }
  ]'::jsonb,
  45.00,
  53.10,
  'pendiente',
  'Av. Arequipa 2580, Lince, Lima',
  'efectivo',
  NULL, -- No tiene ubicación de Google Maps
  NOW()
);

-- Verificar los pedidos insertados
SELECT 
  id,
  usuario_id,
  direccion_envio,
  google_maps_url,
  total,
  estado,
  created_at
FROM pedidos
ORDER BY created_at DESC
LIMIT 10;
