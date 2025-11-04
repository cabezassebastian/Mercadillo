-- Agregar columna google_maps_url a la tabla direcciones_usuario
ALTER TABLE direcciones_usuario 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Agregar comentario a la columna
COMMENT ON COLUMN direcciones_usuario.google_maps_url IS 'URL de Google Maps para la ubicación exacta de la dirección';

-- Agregar columna google_maps_url a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Agregar comentario a la columna
COMMENT ON COLUMN pedidos.google_maps_url IS 'URL de Google Maps de la dirección de entrega del pedido';
