-- Query de diagnóstico para ver las variantes y sus opciones
-- Ejecutar en Supabase SQL Editor para ver qué variantes existen

SELECT 
  pv.id as variant_id,
  p.nombre as producto,
  pv.sku,
  pv.price,
  pv.is_active,
  pv.option_value_ids,
  string_agg(po.name || ': ' || pov.value, ' / ' ORDER BY po.position) as variant_label_completo,
  json_agg(
    json_build_object(
      'option_name', po.name,
      'option_value', pov.value,
      'position', po.position
    ) ORDER BY po.position
  ) as opciones_detalle
FROM product_variants pv
JOIN productos p ON pv.product_id = p.id
JOIN LATERAL unnest(pv.option_value_ids) WITH ORDINALITY AS vals(value_id, ord) ON true
JOIN product_option_values pov ON vals.value_id = pov.id
JOIN product_options po ON pov.option_id = po.id
WHERE p.id = '727773f5-5f29-4ca8-a4f8-435eaeb97cf5'
  AND pv.is_active = true
GROUP BY pv.id, p.nombre, pv.sku, pv.price, pv.is_active, pv.option_value_ids, pv.created_at
ORDER BY pv.created_at
LIMIT 5;
