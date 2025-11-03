-- Script para insertar un pedido de prueba con variantes
-- Ejecutar este script en Supabase SQL Editor

-- Este script asume que ya tienes:
-- 1. Un usuario con ID 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK' (tu usuario de prueba)
-- 2. Un producto con variantes (ID: '727773f5-5f29-4ca8-a4f8-435eaeb97cf5')
-- 3. Variantes de ese producto creadas con opciones de Talla y Color

-- Insertar pedido de prueba con variantes
INSERT INTO pedidos (
  id,
  usuario_id,
  items,
  subtotal,
  total,
  estado,
  direccion_envio,
  metodo_pago,
  mercadopago_preference_id,
  mercadopago_payment_id,
  mercadopago_status,
  mercadopago_external_reference,
  fecha_pago,
  created_at
) VALUES (
  uuid_generate_v4(),
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK', -- Tu usuario
  '[
    {
      "id": "727773f5-5f29-4ca8-a4f8-435eaeb97cf5",
      "nombre": "Producto con variantes",
      "precio": 99.90,
      "cantidad": 2,
      "imagen": "https://via.placeholder.com/300",
      "variant_id": "VARIANT_UUID_1",
      "variant_label": "Talla: M / Color: Rojo"
    },
    {
      "id": "727773f5-5f29-4ca8-a4f8-435eaeb97cf5",
      "nombre": "Producto con variantes",
      "precio": 99.90,
      "cantidad": 1,
      "imagen": "https://via.placeholder.com/300",
      "variant_id": "VARIANT_UUID_2",
      "variant_label": "Talla: L / Color: Azul"
    }
  ]'::jsonb,
  299.70, -- subtotal (2 x 99.90 + 1 x 99.90)
  299.70, -- total
  'pagado',
  'Av. Ejemplo 123, Lima, Perú',
  'mercadopago',
  'test_preference_12345',
  'test_payment_67890',
  'approved',
  'order_test_12345',
  NOW(),
  NOW()
);

-- Verificar que el pedido se insertó correctamente
SELECT 
  p.id,
  p.usuario_id,
  p.items,
  p.total,
  p.estado,
  p.created_at,
  u.email,
  u.nombre || ' ' || u.apellido as nombre_completo
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.id
WHERE p.usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK'
ORDER BY p.created_at DESC
LIMIT 5;

-- También puedes usar esta query para obtener los UUIDs de las variantes reales de tu producto:
-- Ejecuta esto PRIMERO para obtener los variant_ids reales, luego reemplaza en el INSERT de arriba

SELECT 
  pv.id as variant_id,
  p.nombre as producto,
  array_agg(pov.value ORDER BY po.position) as valores_opciones,
  pv.price,
  pv.stock,
  pv.is_active
FROM product_variants pv
JOIN productos p ON pv.product_id = p.id
JOIN LATERAL (
  SELECT unnest(pv.option_value_ids) as value_id
) as vals ON true
JOIN product_option_values pov ON vals.value_id = pov.id
JOIN product_options po ON pov.option_id = po.id
WHERE p.id = '727773f5-5f29-4ca8-a4f8-435eaeb97cf5'
  AND pv.is_active = true
GROUP BY pv.id, p.nombre, pv.price, pv.stock, pv.is_active
ORDER BY pv.created_at
LIMIT 10;
