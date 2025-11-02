-- Fix para función get_top_selling_products
-- Ejecutar este SQL en Supabase SQL Editor

DROP FUNCTION IF EXISTS get_top_selling_products(INTEGER);

CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id uuid, 
  name text, 
  sold integer, 
  revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH ventas AS (
    SELECT 
      (item->>'id')::text AS producto_id,
      (item->>'cantidad')::integer AS cantidad,
      (item->>'precio_unitario')::numeric AS precio_unitario
    FROM pedidos ped,
    LATERAL jsonb_array_elements(ped.items) AS item
    WHERE ped.estado IS NULL OR ped.estado != 'cancelado'
  )
  SELECT 
    p.id, 
    p.nombre AS name, 
    COALESCE(SUM(v.cantidad)::integer, 0) AS sold, 
    COALESCE(SUM(v.cantidad * v.precio_unitario), 0) AS revenue
  FROM productos p
  LEFT JOIN ventas v ON p.id::text = v.producto_id
  GROUP BY p.id, p.nombre
  HAVING COALESCE(SUM(v.cantidad), 0) > 0
  ORDER BY sold DESC
  LIMIT limit_count;
  
  -- Si no hay productos vendidos, retornar los 5 productos con más stock
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.nombre AS name,
      0 AS sold,
      0::numeric AS revenue
    FROM productos p
    ORDER BY p.stock DESC, p.nombre ASC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_top_selling_products(INTEGER) TO anon, authenticated;

-- Test the function
SELECT * FROM get_top_selling_products(5);
