-- Script AUTOMÁTICO para insertar pedido de prueba con variantes
-- Este script obtiene automáticamente las variantes reales del producto
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Obtener las primeras 2 variantes del producto
WITH variantes_producto AS (
  SELECT 
    pv.id as variant_id,
    p.id as producto_id,
    p.nombre as producto_nombre,
    p.imagen as producto_imagen,
    pv.price as variant_price,
    string_agg(po.name || ': ' || pov.value, ' / ' ORDER BY po.position) as variant_label,
    ROW_NUMBER() OVER (ORDER BY pv.created_at) as rn
  FROM product_variants pv
  JOIN productos p ON pv.product_id = p.id
  JOIN LATERAL unnest(pv.option_value_ids) WITH ORDINALITY AS vals(value_id, ord) ON true
  JOIN product_option_values pov ON vals.value_id = pov.id
  JOIN product_options po ON pov.option_id = po.id
  WHERE p.id = '727773f5-5f29-4ca8-a4f8-435eaeb97cf5'
    AND pv.is_active = true
  GROUP BY pv.id, p.id, p.nombre, p.imagen, pv.price, pv.created_at
  LIMIT 2
),
-- Paso 2: Construir el array de items
items_pedido AS (
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', producto_id::text,
        'nombre', producto_nombre,
        'precio', variant_price,
        'cantidad', CASE WHEN rn = 1 THEN 2 ELSE 1 END, -- Primera variante: 2 unidades, segunda: 1
        'imagen', producto_imagen,
        'variant_id', variant_id::text,
        'variant_label', variant_label
      )
    ) as items,
    SUM(variant_price * CASE WHEN rn = 1 THEN 2 ELSE 1 END) as total_calculado
  FROM variantes_producto
)
-- Paso 3: Insertar el pedido
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
)
SELECT 
  uuid_generate_v4(),
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  items,
  total_calculado,
  total_calculado,
  'pagado',
  'Av. Lima 456, San Isidro, Lima, Perú',
  'mercadopago',
  'test_pref_' || substr(md5(random()::text), 1, 10),
  'test_pay_' || substr(md5(random()::text), 1, 10),
  'approved',
  'order_test_' || substr(md5(random()::text), 1, 10),
  NOW(),
  NOW()
FROM items_pedido
RETURNING 
  id as pedido_id,
  usuario_id,
  total,
  estado,
  items::text as items_resumen;

-- Verificación: Ver el pedido recién creado con detalles de variantes
SELECT 
  p.id as pedido_id,
  p.created_at as fecha,
  p.estado,
  p.total,
  p.direccion_envio,
  u.nombre || ' ' || u.apellido as cliente,
  u.email,
  jsonb_pretty(p.items) as items_detalle
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.id
WHERE p.usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK'
ORDER BY p.created_at DESC
LIMIT 1;
