
-- Compatibility migration: create pedidos_productos view only (no product column changes)
-- The repository's `productos` table already has the fields you listed (imagen, categoria, rating_promedio, total_vendidos),
-- so this migration intentionally avoids altering `productos` and only creates a compatibility view for orders.

DO $$
BEGIN
  -- Only create the view if the pedidos table exists
  IF to_regclass('public.pedidos') IS NOT NULL THEN
    -- If the view already exists with different column ordering/names, DROP it first to avoid
    -- 'cannot change name of view column' errors when running CREATE OR REPLACE VIEW inside
    -- an EXECUTE block. This keeps the migration idempotent and safe to re-run.
    IF to_regclass('public.pedidos_productos') IS NOT NULL THEN
      EXECUTE 'DROP VIEW public.pedidos_productos CASCADE';
    END IF;

    EXECUTE $sql$
      CREATE VIEW public.pedidos_productos AS
      SELECT
        (item->>'id')::uuid AS producto_id,
        p.id AS pedido_id,
        COALESCE((item->>'cantidad')::int, 1) AS cantidad,
        -- extract precio_unitario if stored in the order item JSON (compatibility)
        CASE WHEN (item ? 'precio_unitario') THEN (item->>'precio_unitario')::numeric ELSE NULL END AS precio_unitario,
        p.created_at
      FROM public.pedidos p,
      LATERAL jsonb_array_elements(p.items) AS item
      WHERE p.items IS NOT NULL;
    $sql$;
  ELSE
    RAISE NOTICE 'Skipping creation of view public.pedidos_productos because table public.pedidos does not exist';
  END IF;
END$$;

-- Note: if Row Level Security (RLS) is enabled on `pedidos`, consider creating an RPC (SECURITY DEFINER)
-- that queries this view and grants EXECUTE to the anon role instead of exposing the view directly.

