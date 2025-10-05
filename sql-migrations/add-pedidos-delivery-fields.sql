-- Migración: Agregar campos de entrega y contacto a la tabla pedidos
-- Fecha: 2025-10-05
-- Descripción: Agrega campos para almacenar información detallada de entrega y contacto del cliente

-- Agregar columnas de información de entrega
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS metodo_entrega VARCHAR(20) CHECK (metodo_entrega IN ('envio', 'contraentrega', 'tienda')),
ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(25),
ADD COLUMN IF NOT EXISTS dni_cliente VARCHAR(8),
ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(200),
ADD COLUMN IF NOT EXISTS notas_entrega TEXT;

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_pedidos_metodo_entrega ON pedidos(metodo_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_dni_cliente ON pedidos(dni_cliente);

-- Comentarios en las columnas
COMMENT ON COLUMN pedidos.metodo_entrega IS 'Método de entrega: envio (Olva Courier), contraentrega (Tren Línea 1), tienda (Recojo en tienda)';
COMMENT ON COLUMN pedidos.telefono_contacto IS 'Teléfono de contacto del cliente para el pedido';
COMMENT ON COLUMN pedidos.dni_cliente IS 'DNI del cliente (solo requerido para método envio - Olva Courier)';
COMMENT ON COLUMN pedidos.nombre_completo IS 'Nombre completo del cliente para el pedido';
COMMENT ON COLUMN pedidos.notas_entrega IS 'Notas adicionales sobre la entrega (ej: estación del tren, referencia, etc.)';
