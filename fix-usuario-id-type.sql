-- 🔧 Fix: Cambiar tipo de columna usuario_id de UUID a TEXT
-- Este script corrige el problema de tipo de dato en las tablas de perfil de usuario

-- IMPORTANTE: Este script ELIMINARÁ los datos existentes en estas tablas
-- porque PostgreSQL no puede convertir UUID a TEXT automáticamente
-- Si tienes datos importantes, haz backup primero

-- 1. Deshabilitar RLS temporalmente para hacer cambios
ALTER TABLE lista_deseos DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_navegacion DISABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones_usuario DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes (para recrearlas después)
DROP POLICY IF EXISTS "Usuarios pueden ver su propia lista de deseos" ON lista_deseos;
DROP POLICY IF EXISTS "Usuarios pueden gestionar su lista de deseos" ON lista_deseos;
DROP POLICY IF EXISTS "Usuarios pueden ver su historial" ON historial_navegacion;
DROP POLICY IF EXISTS "Sistema puede actualizar historial" ON historial_navegacion;
DROP POLICY IF EXISTS "Admins pueden ver todo el historial" ON historial_navegacion;
DROP POLICY IF EXISTS "Usuarios pueden ver sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario;

-- 3. Eliminar tablas y recrearlas con el tipo correcto
DROP TABLE IF EXISTS lista_deseos CASCADE;
DROP TABLE IF EXISTS historial_navegacion CASCADE;
DROP TABLE IF EXISTS direcciones_usuario CASCADE;

-- 4. Recrear tabla de lista de deseos (usuario_id como TEXT)
CREATE TABLE lista_deseos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- 5. Recrear tabla de historial de navegación
CREATE TABLE historial_navegacion (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Recrear tabla de direcciones
CREATE TABLE direcciones_usuario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
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

-- 7. Recrear índices
CREATE INDEX idx_lista_deseos_usuario_id ON lista_deseos(usuario_id);
CREATE INDEX idx_lista_deseos_producto_id ON lista_deseos(producto_id);
CREATE INDEX idx_historial_navegacion_usuario_id ON historial_navegacion(usuario_id);
CREATE INDEX idx_historial_navegacion_producto_id ON historial_navegacion(producto_id);
CREATE INDEX idx_historial_navegacion_created_at ON historial_navegacion(created_at);
CREATE INDEX idx_direcciones_usuario_id ON direcciones_usuario(usuario_id);
CREATE INDEX idx_direcciones_predeterminada ON direcciones_usuario(es_predeterminada);

-- 8. Recrear triggers
CREATE TRIGGER update_historial_navegacion_updated_at BEFORE UPDATE ON historial_navegacion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direcciones_usuario_updated_at BEFORE UPDATE ON direcciones_usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_direccion_predeterminada
    BEFORE INSERT OR UPDATE ON direcciones_usuario
    FOR EACH ROW EXECUTE FUNCTION asegurar_direccion_predeterminada();

-- 9. Habilitar RLS
ALTER TABLE lista_deseos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- 10. Recrear políticas RLS
CREATE POLICY "Usuarios pueden ver su propia lista de deseos" ON lista_deseos
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar su lista de deseos" ON lista_deseos
    FOR ALL USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden ver su historial" ON historial_navegacion
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Sistema puede actualizar historial" ON historial_navegacion
    FOR ALL USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden ver sus direcciones" ON direcciones_usuario
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario
    FOR ALL USING (auth.uid()::text = usuario_id);

CREATE POLICY "Admins pueden ver todo el historial" ON historial_navegacion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- 11. Verificación
SELECT 'Tablas recreadas exitosamente ✅' as status;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('lista_deseos', 'historial_navegacion', 'direcciones_usuario')
    AND column_name = 'usuario_id';
