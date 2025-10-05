-- ============================================
-- MIGRACIÓN: Sistema de Tracking de Pedidos
-- ============================================
-- Descripción: Añade campos para rastrear el estado y fechas de los pedidos
-- Fecha: 2025-10-04
-- Autor: Sistema de Emails Transaccionales

-- Añadir columnas de tracking a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' 
  CHECK (estado IN ('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado')),
ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_envio TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP,
ADD COLUMN IF NOT EXISTS numero_seguimiento VARCHAR(100);

-- Crear índice para optimizar consultas por estado
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);

-- Actualizar pedidos existentes al estado 'confirmado' si tienen fecha de creación
UPDATE pedidos 
SET estado = 'confirmado', 
    fecha_confirmacion = created_at
WHERE estado IS NULL OR estado = 'pendiente';

-- Comentarios para documentación
COMMENT ON COLUMN pedidos.estado IS 'Estado actual del pedido: pendiente, confirmado, enviado, entregado, cancelado';
COMMENT ON COLUMN pedidos.fecha_confirmacion IS 'Fecha cuando el pedido fue confirmado (pago exitoso)';
COMMENT ON COLUMN pedidos.fecha_envio IS 'Fecha cuando el pedido fue enviado al cliente';
COMMENT ON COLUMN pedidos.fecha_entrega IS 'Fecha cuando el pedido fue entregado';
COMMENT ON COLUMN pedidos.numero_seguimiento IS 'Número de seguimiento del courier (opcional)';
