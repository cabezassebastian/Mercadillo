-- Migración para actualizar la tabla de reseñas
-- Ejecutar en Supabase SQL Editor

-- Primero eliminar las políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden crear reseñas" ON resenas;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias reseñas" ON resenas;

-- Eliminar la restricción UNIQUE existente
ALTER TABLE resenas DROP CONSTRAINT IF EXISTS resenas_usuario_id_producto_id_key;

-- Agregar la columna pedido_id si no existe
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE;
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear nueva restricción UNIQUE
ALTER TABLE resenas ADD CONSTRAINT resenas_usuario_id_producto_id_pedido_id_key 
    UNIQUE(usuario_id, producto_id, pedido_id);

-- Crear trigger para updated_at
CREATE TRIGGER update_resenas_updated_at BEFORE UPDATE ON resenas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear nuevas políticas
CREATE POLICY "Usuarios pueden crear reseñas si compraron el producto" ON resenas
    FOR INSERT WITH CHECK (
        auth.uid()::text = usuario_id AND
        EXISTS (
            SELECT 1 FROM pedidos 
            WHERE id = pedido_id 
            AND usuario_id = auth.uid()::text 
            AND estado = 'entregado'
        )
    );

CREATE POLICY "Usuarios pueden actualizar sus propias reseñas" ON resenas
    FOR UPDATE USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propias reseñas" ON resenas
    FOR DELETE USING (auth.uid()::text = usuario_id);