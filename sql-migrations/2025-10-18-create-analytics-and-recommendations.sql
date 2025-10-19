-- Consolidated migration: analytics + recommendations functions
-- Run this file in Supabase SQL editor (Project → SQL) to create RPCs used by the admin dashboard.

-- ============================================
-- Analytics functions
-- ============================================
CREATE OR REPLACE FUNCTION public.get_top_selling_products(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  id uuid,
  name text,
  sold integer,
  revenue numeric
) AS $$
SELECT 
  p.id, 
  p.nombre AS name, 
  COALESCE(SUM(pp.cantidad)::integer, 0) AS sold, 
  -- If pedidos_productos has precio_unitario, use it; otherwise fall back to producto precio
  COALESCE(SUM(pp.cantidad * COALESCE(pp.precio_unitario, p.precio)), 0) AS revenue
FROM productos p
LEFT JOIN pedidos_productos pp ON p.id = pp.producto_id
LEFT JOIN pedidos ped ON pp.pedido_id = ped.id
-- Only count delivered orders for sales analytics
WHERE ped.estado = 'entregado'
GROUP BY p.id, p.nombre
HAVING SUM(pp.cantidad) > 0
ORDER BY sold DESC
LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- product_views table for tracking
CREATE TABLE IF NOT EXISTS product_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  user_id text REFERENCES usuarios(id) ON DELETE SET NULL,
  viewed_at timestamp DEFAULT now(),
  session_id text
);
CREATE INDEX IF NOT EXISTS idx_product_views_producto_id ON product_views(producto_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);

CREATE OR REPLACE FUNCTION public.get_daily_sales(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  date text,
  total numeric,
  orders_count bigint
) AS $$
SELECT 
  TO_CHAR(created_at, 'DD/MM') AS date,
  COALESCE(SUM(total), 0) AS total,
  COUNT(*) AS orders_count
FROM pedidos
WHERE 
  created_at >= CURRENT_DATE - (days_back || ' days')::interval
  AND estado = 'entregado'
GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
ORDER BY DATE(created_at) ASC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_weekly_sales(weeks_back INTEGER DEFAULT 4)
RETURNS TABLE(
  week_label text,
  total numeric,
  orders_count bigint
) AS $$
SELECT 
  'Sem ' || TO_CHAR(created_at, 'WW') AS week_label,
  COALESCE(SUM(total), 0) AS total,
  COUNT(*) AS orders_count
FROM pedidos
WHERE 
  created_at >= CURRENT_DATE - (weeks_back || ' weeks')::interval
  AND estado = 'entregado'
GROUP BY TO_CHAR(created_at, 'WW'), DATE_TRUNC('week', created_at)
ORDER BY DATE_TRUNC('week', created_at) ASC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_monthly_sales(months_back INTEGER DEFAULT 12)
RETURNS TABLE(
  month text,
  total numeric,
  orders_count bigint
) AS $$
SELECT 
  TO_CHAR(created_at, 'Mon YYYY') AS month,
  COALESCE(SUM(total), 0) AS total,
  COUNT(*) AS orders_count
FROM pedidos
WHERE 
  created_at >= CURRENT_DATE - (months_back || ' months')::interval
  AND estado = 'entregado'
GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at) ASC;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_conversion_rate()
RETURNS TABLE(
  total_views bigint,
  total_orders bigint,
  conversion_rate numeric
) AS $$
SELECT 
  (SELECT COUNT(DISTINCT producto_id) FROM product_views) AS total_views,
  (SELECT COUNT(*) FROM pedidos WHERE estado = 'entregado') AS total_orders,
  CASE 
    WHEN (SELECT COUNT(DISTINCT producto_id) FROM product_views) > 0 
    THEN ROUND(
      ((SELECT COUNT(*) FROM pedidos WHERE estado = 'entregado')::numeric / 
       (SELECT COUNT(DISTINCT producto_id) FROM product_views)::numeric) * 100, 
      2
    )
    ELSE 0
  END AS conversion_rate;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_low_stock_products(threshold INTEGER DEFAULT 5)
RETURNS TABLE(
  id uuid,
  nombre text,
  stock integer,
  precio numeric,
  categoria text
) AS $$
SELECT 
  id,
  nombre,
  stock,
  precio,
  categoria
FROM productos
WHERE stock <= threshold AND stock >= 0
ORDER BY stock ASC, nombre ASC;
$$ LANGUAGE sql STABLE;


-- ============================================
-- Recommendation helper functions (defensive, SECURITY DEFINER)
-- ============================================
create or replace function public.get_also_bought_products(p_product_id uuid, p_limit int)
returns table(id uuid, nombre text, precio numeric, slug text, imagenes jsonb, rating_promedio numeric)
language plpgsql stable security definer as $$
begin
  if to_regclass('public.pedidos_productos') is null or to_regclass('public.productos') is null then
    return;
  end if;

  return query
  select pr.id, pr.nombre, pr.precio, pr.slug, pr.imagenes, pr.rating_promedio from (
    select pp.producto_id, count(*) as cnt
    from pedidos_productos pp
    where pp.pedido_id in (
      select pedido_id from pedidos_productos where producto_id = p_product_id
    )
    and pp.producto_id != p_product_id
    group by pp.producto_id
    order by cnt desc
    limit p_limit
  ) as x
  join productos pr on pr.id = x.producto_id;
end;
$$;

create or replace function public.get_top_selling_products(p_period text, p_limit int)
returns table(id uuid, nombre text, precio numeric, slug text, imagenes jsonb, rating_promedio numeric)
language plpgsql stable security definer as $$
declare
  since timestamptz := null;
begin
  if to_regclass('public.pedidos_productos') is null or to_regclass('public.pedidos') is null or to_regclass('public.productos') is null then
    return;
  end if;

  if p_period = 'week' then
    since := now() - interval '7 days';
  elsif p_period = 'month' then
    since := now() - interval '30 days';
  end if;

  return query
  select pr.id, pr.nombre, pr.precio, pr.slug, pr.imagenes, pr.rating_promedio
  from (
    select pp.producto_id, sum(pp.cantidad) as total_sold
    from pedidos_productos pp
    join pedidos p on p.id = pp.pedido_id
    where (since is null or p.created_at >= since)
      and p.estado = 'entregado'
    group by pp.producto_id
    order by total_sold desc
    limit p_limit
  ) s
  join productos pr on pr.id = s.producto_id;
end;
$$;

create or replace function public.get_related_by_category_price(p_product_id uuid, p_limit int)
returns table(id uuid, nombre text, precio numeric, slug text, imagenes jsonb, rating_promedio numeric)
language plpgsql stable security definer as $$
declare
  base record;
  min_price numeric;
  max_price numeric;
begin
  if to_regclass('public.productos') is null then
    return;
  end if;

  select id, categoria_id, precio into base from productos where id = p_product_id;
  if not found then
    return;
  end if;

  min_price := base.precio * 0.8;
  max_price := base.precio * 1.2;

  return query
  select pr.id, pr.nombre, pr.precio, pr.slug, pr.imagenes, pr.rating_promedio
  from productos pr
  where pr.categoria_id = base.categoria_id
    and pr.precio >= min_price
    and pr.precio <= max_price
    and pr.id != p_product_id
  order by pr.rating_promedio desc nulls last
  limit p_limit;
end;
$$;


-- Grants: allow public/anon to execute the most common read-only analytics functions
GRANT EXECUTE ON FUNCTION public.get_top_selling_products(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_monthly_sales(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_conversion_rate() TO anon;
GRANT EXECUTE ON FUNCTION public.get_low_stock_products(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_also_bought_products(uuid, integer) TO anon;

-- Done
