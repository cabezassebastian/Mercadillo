-- Migration: Agregar campos de cupón a tabla pedidos
-- Run this SQL in Supabase SQL Editor

-- Agregar columnas para cupones en la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS descuento DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cupon_codigo VARCHAR(50) DEFAULT NULL;

-- Índice para búsquedas por cupón
CREATE INDEX IF NOT EXISTS idx_pedidos_cupon_codigo ON pedidos(cupon_codigo);

-- Comentarios
COMMENT ON COLUMN pedidos.descuento IS 'Descuento aplicado por cupón (en soles)';
COMMENT ON COLUMN pedidos.cupon_codigo IS 'Código del cupón utilizado en este pedido';
