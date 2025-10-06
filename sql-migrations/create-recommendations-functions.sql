-- SQL migrations to add recommendation helper functions
-- Function: get_also_bought_products(p_product_id uuid, p_limit int)
-- Returns: setof productos (id, nombre, precio, slug, imagenes, rating_promedio)

create or replace function public.get_also_bought_products(p_product_id uuid, p_limit int)
returns table(id uuid, nombre text, precio numeric, slug text, imagenes jsonb, rating_promedio numeric)
language sql stable security definer as $$
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
$$;

-- Function: get_top_selling_products(p_period text, p_limit int)
-- p_period: 'week'|'month'|'all'
create or replace function public.get_top_selling_products(p_period text, p_limit int)
returns table(id uuid, nombre text, precio numeric, slug text, imagenes jsonb, rating_promedio numeric)
language plpgsql stable security definer as $$
declare
  since timestamptz := null;
begin
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
    group by pp.producto_id
    order by total_sold desc
    limit p_limit
  ) s
  join productos pr on pr.id = s.producto_id;
end;
$$;

-- Grants (optional): allow anon role to call these functions if needed
-- GRANT EXECUTE ON FUNCTION public.get_also_bought_products(uuid,int) TO anon;
-- GRANT EXECUTE ON FUNCTION public.get_top_selling_products(text,int) TO anon;
