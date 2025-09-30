-- Migración: Agregar funcionalidades de perfil de usuario
-- Lista de deseos, historial de navegación, direcciones
-- Fecha: 2025-09-30

-- 1. Tabla de lista de deseos
CREATE TABLE IF NOT EXISTS lista_deseos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- 2. Tabla de historial de navegación
CREATE TABLE IF NOT EXISTS historial_navegacion (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de direcciones del usuario
CREATE TABLE IF NOT EXISTS direcciones_usuario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL, -- "Casa", "Trabajo", "Oficina", etc.
    direccion_completa TEXT NOT NULL,
    distrito TEXT,
    provincia TEXT DEFAULT 'Lima',
    departamento TEXT DEFAULT 'Lima',
    codigo_postal TEXT,
    referencia TEXT,
    telefono_contacto TEXT,
    es_predeterminada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_lista_deseos_usuario_id ON lista_deseos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lista_deseos_producto_id ON lista_deseos(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_usuario_id ON historial_navegacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_producto_id ON historial_navegacion(producto_id);
CREATE INDEX IF NOT EXISTS idx_historial_navegacion_created_at ON historial_navegacion(created_at);
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario_id ON direcciones_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_direcciones_predeterminada ON direcciones_usuario(es_predeterminada);

-- 5. Trigger para updated_at en las nuevas tablas
CREATE TRIGGER update_historial_navegacion_updated_at BEFORE UPDATE ON historial_navegacion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direcciones_usuario_updated_at BEFORE UPDATE ON direcciones_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Función para limpiar historial antiguo (más de 30 días)
CREATE OR REPLACE FUNCTION limpiar_historial_antiguo()
RETURNS INTEGER AS $$
DECLARE
    filas_eliminadas INTEGER;
BEGIN
    DELETE FROM historial_navegacion 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS filas_eliminadas = ROW_COUNT;
    RETURN filas_eliminadas;
END;
$$ language 'plpgsql';

-- 7. Función para actualizar historial de navegación (evitar duplicados)
CREATE OR REPLACE FUNCTION actualizar_historial_navegacion(
    p_usuario_id TEXT,
    p_producto_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Buscar si ya existe el registro
    UPDATE historial_navegacion 
    SET updated_at = NOW()
    WHERE usuario_id = p_usuario_id AND producto_id = p_producto_id;
    
    -- Si no existe, crearlo
    IF NOT FOUND THEN
        INSERT INTO historial_navegacion (usuario_id, producto_id)
        VALUES (p_usuario_id, p_producto_id);
    END IF;
END;
$$ language 'plpgsql';

-- 8. Función para asegurar solo una dirección predeterminada por usuario
CREATE OR REPLACE FUNCTION asegurar_direccion_predeterminada()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la nueva/actualizada dirección es predeterminada
    IF NEW.es_predeterminada = TRUE THEN
        -- Quitar predeterminada de todas las otras direcciones del usuario
        UPDATE direcciones_usuario 
        SET es_predeterminada = FALSE 
        WHERE usuario_id = NEW.usuario_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger para dirección predeterminada
CREATE TRIGGER trigger_direccion_predeterminada
    BEFORE INSERT OR UPDATE ON direcciones_usuario
    FOR EACH ROW EXECUTE FUNCTION asegurar_direccion_predeterminada();

-- 10. Políticas de seguridad (RLS)
ALTER TABLE lista_deseos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas para lista de deseos
CREATE POLICY "Usuarios pueden ver su propia lista de deseos" ON lista_deseos
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar su lista de deseos" ON lista_deseos
    FOR ALL USING (auth.uid()::text = usuario_id);

-- Políticas para historial de navegación
CREATE POLICY "Usuarios pueden ver su historial" ON historial_navegacion
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Sistema puede actualizar historial" ON historial_navegacion
    FOR ALL USING (auth.uid()::text = usuario_id);

-- Políticas para direcciones
CREATE POLICY "Usuarios pueden ver sus direcciones" ON direcciones_usuario
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario
    FOR ALL USING (auth.uid()::text = usuario_id);

-- Políticas para admins
CREATE POLICY "Admins pueden ver todo el historial" ON historial_navegacion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- 11. Comentarios para documentación
COMMENT ON TABLE lista_deseos IS 'Lista de productos favoritos del usuario';
COMMENT ON TABLE historial_navegacion IS 'Historial de productos visitados por el usuario';
COMMENT ON TABLE direcciones_usuario IS 'Direcciones de envío guardadas del usuario';

COMMENT ON COLUMN direcciones_usuario.nombre IS 'Nombre descriptivo de la dirección (Casa, Trabajo, etc.)';
COMMENT ON COLUMN direcciones_usuario.es_predeterminada IS 'Indica si es la dirección predeterminada del usuario';

-- 12. Verificación final
SELECT 'Lista de deseos' as tabla, COUNT(*) as registros FROM lista_deseos
UNION ALL
SELECT 'Historial navegación' as tabla, COUNT(*) as registros FROM historial_navegacion  
UNION ALL
SELECT 'Direcciones usuario' as tabla, COUNT(*) as registros FROM direcciones_usuario;