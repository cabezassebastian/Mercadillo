-- ============================================
-- MEJORA DEL SISTEMA DE VARIANTES
-- ============================================
-- Este script mejora el sistema de variantes haciéndolo más claro y funcional

-- 1. Crear vista para obtener variantes con nombres legibles
CREATE OR REPLACE VIEW variantes_con_detalles AS
SELECT 
    pv.id AS variante_id,
    pv.product_id,
    pv.price,
    pv.stock,
    pv.is_active,
    pv.sku,
    pv.attributes,
    pv.option_value_ids,
    pv.created_at,
    -- Construir nombre legible de la variante
    (
        SELECT STRING_AGG(
            po.name || ': ' || pov.value, 
            ', ' 
            ORDER BY po.position, pov.position
        )
        FROM unnest(pv.option_value_ids) AS vid
        JOIN product_option_values pov ON pov.id = vid
        JOIN product_options po ON po.id = pov.option_id
    ) AS variante_nombre,
    -- Array de opciones {name, value, metadata}
    (
        SELECT json_agg(
            json_build_object(
                'option_name', po.name,
                'option_value', pov.value,
                'value_id', pov.id,
                'metadata', pov.metadata
            )
            ORDER BY po.position, pov.position
        )
        FROM unnest(pv.option_value_ids) AS vid
        JOIN product_option_values pov ON pov.id = vid
        JOIN product_options po ON po.id = pov.option_id
    ) AS opciones_detalle
FROM product_variants pv;

-- Grant permissions para la vista
GRANT SELECT ON variantes_con_detalles TO anon, authenticated;

-- 2. Función para obtener variantes de un producto con detalles
CREATE OR REPLACE FUNCTION get_product_variants_detailed(product_uuid uuid)
RETURNS TABLE(
    variante_id uuid,
    variante_nombre text,
    price numeric,
    stock int,
    is_active boolean,
    sku text,
    opciones_detalle json
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vcd.variante_id,
        COALESCE(vcd.variante_nombre, 'Sin opciones') AS variante_nombre,
        vcd.price,
        vcd.stock,
        vcd.is_active,
        vcd.sku,
        vcd.opciones_detalle
    FROM variantes_con_detalles vcd
    WHERE vcd.product_id = product_uuid
    ORDER BY vcd.variante_nombre;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_product_variants_detailed(uuid) TO anon, authenticated;

-- 3. Función para buscar variante por opciones seleccionadas
CREATE OR REPLACE FUNCTION find_variant_by_options(
    product_uuid uuid,
    selected_option_value_ids uuid[]
)
RETURNS TABLE(
    variante_id uuid,
    variante_nombre text,
    price numeric,
    stock int,
    is_active boolean,
    sku text,
    opciones_detalle json
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vcd.variante_id,
        COALESCE(vcd.variante_nombre, 'Sin opciones') AS variante_nombre,
        vcd.price,
        vcd.stock,
        vcd.is_active,
        vcd.sku,
        vcd.opciones_detalle
    FROM variantes_con_detalles vcd
    WHERE vcd.product_id = product_uuid
        AND vcd.option_value_ids @> selected_option_value_ids
        AND vcd.option_value_ids <@ selected_option_value_ids
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION find_variant_by_options(uuid, uuid[]) TO anon, authenticated;

-- 4. Añadir campo variant_info a pedidos para almacenar info de variante seleccionada
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS variant_info jsonb DEFAULT NULL;

COMMENT ON COLUMN pedidos.variant_info IS 'Información de variantes seleccionadas por producto {producto_id: {variant_id, variant_name, options}}';

-- 5. Función helper para validar stock de variante antes de pedido
CREATE OR REPLACE FUNCTION check_variant_stock(
    product_uuid uuid,
    variant_uuid uuid,
    requested_quantity int
)
RETURNS boolean AS $$
DECLARE
    available_stock int;
    variant_active boolean;
BEGIN
    -- Obtener stock y estado de la variante
    SELECT stock, is_active 
    INTO available_stock, variant_active
    FROM product_variants
    WHERE id = variant_uuid 
        AND product_id = product_uuid;
    
    -- Si no existe la variante, retornar false
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Verificar si está activa y tiene stock suficiente
    IF variant_active AND (available_stock IS NULL OR available_stock >= requested_quantity) THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_variant_stock(uuid, uuid, int) TO anon, authenticated;

-- 6. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_active 
ON product_variants(product_id, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_product_options_product 
ON product_options(product_id);

CREATE INDEX IF NOT EXISTS idx_product_option_values_option 
ON product_option_values(option_id);

-- 7. Comentarios para documentación
COMMENT ON TABLE product_options IS 'Opciones de producto (ej: Talla, Color)';
COMMENT ON TABLE product_option_values IS 'Valores de opciones (ej: S, M, L para Talla)';
COMMENT ON TABLE product_variants IS 'Variantes de producto - combinaciones de option_value_ids con precio y stock propios';
COMMENT ON VIEW variantes_con_detalles IS 'Vista que muestra variantes con nombres legibles para admin';

-- Test de las funciones
SELECT * FROM get_product_variants_detailed(
    (SELECT id FROM productos LIMIT 1)
) LIMIT 5;

SELECT 'Migración completada exitosamente' AS status;
