-- SQL migration for analytics functions

-- Top selling products function
CREATE OR REPLACE FUNCTION get_top_selling_products()
RETURNS TABLE(id uuid, name text, sold integer, revenue numeric) AS $$
SELECT p.id, p.nombre, SUM(pp.cantidad) AS sold, SUM(pp.cantidad * p.precio) AS revenue
FROM pedidos_productos pp
JOIN productos p ON p.id = pp.producto_id
GROUP BY p.id, p.nombre
ORDER BY sold DESC
LIMIT 5;
$$ LANGUAGE sql STABLE;

CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid REFERENCES productos(id),
  user_id text REFERENCES usuarios(id),
  viewed_at timestamp DEFAULT now()
);

-- Monthly sales function for dashboard chart
CREATE OR REPLACE FUNCTION get_monthly_sales()
RETURNS TABLE(month text, total numeric) AS $$
SELECT TO_CHAR(created_at, 'Mon') AS month, SUM(total) AS total
FROM pedidos
WHERE estado IS NULL OR estado != 'cancelado'
GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
ORDER BY EXTRACT(MONTH FROM MIN(created_at));
$$ LANGUAGE sql STABLE;
