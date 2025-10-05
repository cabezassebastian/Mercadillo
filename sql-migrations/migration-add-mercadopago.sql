-- Migración incremental: Agregar campos de MercadoPago a tabla existente
-- Ejecutar este script en Supabase SQL Editor
-- Fecha: 2025-09-30

-- 1. Agregar columnas de MercadoPago a la tabla pedidos existente
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mercadopago_status_detail TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_payment_type TEXT,
ADD COLUMN IF NOT EXISTS mercadopago_external_reference TEXT;

-- 2. Actualizar constraint de metodo_pago para remover stripe y agregar mercadopago
ALTER TABLE pedidos 
DROP CONSTRAINT IF EXISTS pedidos_metodo_pago_check;

ALTER TABLE pedidos 
ADD CONSTRAINT pedidos_metodo_pago_check 
CHECK (metodo_pago IN ('mercadopago', 'transferencia', 'efectivo'));

-- 3. Actualizar constraint de estado para incluir nuevos estados
ALTER TABLE pedidos 
DROP CONSTRAINT IF EXISTS pedidos_estado_check;

ALTER TABLE pedidos 
ADD CONSTRAINT pedidos_estado_check 
CHECK (estado IN (
  'pendiente',      -- Pedido creado, esperando pago
  'pagado',         -- Pago confirmado por MercadoPago
  'procesando',     -- Preparando el pedido
  'enviado',        -- Pedido enviado
  'entregado',      -- Pedido entregado
  'cancelado',      -- Pedido cancelado
  'fallido'         -- Pago rechazado
));

-- 4. Eliminar columna de stripe si existe
ALTER TABLE pedidos 
DROP COLUMN IF EXISTS stripe_session_id;

-- 5. Crear índices para MercadoPago
CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_preference_id 
ON pedidos(mercadopago_preference_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_payment_id 
ON pedidos(mercadopago_payment_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_mercadopago_status 
ON pedidos(mercadopago_status);

CREATE INDEX IF NOT EXISTS idx_pedidos_external_reference 
ON pedidos(mercadopago_external_reference);

-- 6. Función para actualizar estado del pedido basado en MercadoPago
CREATE OR REPLACE FUNCTION update_order_status_from_mercadopago()
RETURNS TRIGGER AS $$
BEGIN
    -- Mapear estados de MercadoPago a estados de pedido
    CASE NEW.mercadopago_status
        WHEN 'approved' THEN 
            NEW.estado = 'pagado';
            NEW.fecha_pago = NOW();
        WHEN 'pending' THEN 
            NEW.estado = 'pendiente';
        WHEN 'in_process' THEN 
            NEW.estado = 'pendiente';
        WHEN 'cancelled' THEN 
            NEW.estado = 'cancelado';
        WHEN 'rejected' THEN 
            NEW.estado = 'fallido';
        ELSE 
            -- Mantener estado actual si no reconocemos el estado de MP
            NULL;
    END CASE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger para actualizar estado automáticamente
DROP TRIGGER IF EXISTS update_pedido_status_from_mp ON pedidos;
CREATE TRIGGER update_pedido_status_from_mp 
    BEFORE UPDATE ON pedidos
    FOR EACH ROW 
    WHEN (OLD.mercadopago_status IS DISTINCT FROM NEW.mercadopago_status)
    EXECUTE FUNCTION update_order_status_from_mercadopago();

-- 8. Política adicional para webhooks
DROP POLICY IF EXISTS "Sistema puede actualizar pedidos via webhook" ON pedidos;
CREATE POLICY "Sistema puede actualizar pedidos via webhook" ON pedidos
    FOR UPDATE 
    USING (true);  -- Para webhooks de MercadoPago

-- 9. Actualizar política de reseñas para incluir estado 'pagado'
DROP POLICY IF EXISTS "Usuarios pueden crear reseñas si compraron el producto" ON resenas;
CREATE POLICY "Usuarios pueden crear reseñas si compraron el producto" ON resenas
    FOR INSERT WITH CHECK (
        auth.uid()::text = usuario_id AND
        EXISTS (
            SELECT 1 FROM pedidos 
            WHERE id = pedido_id 
            AND usuario_id = auth.uid()::text 
            AND estado IN ('pagado', 'entregado')
            AND JSON_EXTRACT_PATH_TEXT(items::json, '$[*].id') LIKE '%' || producto_id::text || '%'
        )
    );

-- 10. Comentarios para documentación
COMMENT ON COLUMN pedidos.mercadopago_preference_id IS 'ID de preferencia de MercadoPago';
COMMENT ON COLUMN pedidos.mercadopago_payment_id IS 'ID de pago de MercadoPago';
COMMENT ON COLUMN pedidos.mercadopago_status IS 'Estado del pago en MercadoPago';
COMMENT ON COLUMN pedidos.mercadopago_external_reference IS 'Referencia externa para identificar el pedido';

-- Verificación final
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND column_name LIKE 'mercadopago%'
ORDER BY column_name;