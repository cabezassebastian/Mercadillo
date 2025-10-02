-- 🔧 FIX DEFINITIVO: Cambiar usuario_id de UUID a TEXT en TODAS las tablas
-- Este script arregla historial_navegacion y direcciones_usuario
-- (lista_deseos ya fue arreglado anteriormente)

-- ⚠️ IMPORTANTE: Este script eliminará los datos existentes en estas tablas
-- Ejecutar en Supabase SQL Editor

-- ==========================================
-- PARTE 1: VERIFICAR ESTADO ACTUAL
-- ==========================================
SELECT 
    table_name,
    column_name,
    data_type,
    '❌ ANTES (debería ser uuid)' as estado
FROM information_schema.columns
WHERE table_name IN ('historial_navegacion', 'direcciones_usuario')
    AND column_name = 'usuario_id'
ORDER BY table_name;

-- ==========================================
-- PARTE 2: HISTORIAL_NAVEGACION
-- ==========================================

-- 2.1: Deshabilitar RLS
ALTER TABLE historial_navegacion DISABLE ROW LEVEL SECURITY;

-- 2.2: Eliminar políticas
DROP POLICY IF EXISTS "Usuarios pueden ver su historial" ON historial_navegacion;
DROP POLICY IF EXISTS "Sistema puede actualizar historial" ON historial_navegacion;
DROP POLICY IF EXISTS "Admins pueden ver todo el historial" ON historial_navegacion;

-- 2.3: Eliminar y recrear tabla
DROP TABLE IF EXISTS historial_navegacion CASCADE;

CREATE TABLE historial_navegacion (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4: Crear índices
CREATE INDEX idx_historial_navegacion_usuario_id ON historial_navegacion(usuario_id);
CREATE INDEX idx_historial_navegacion_producto_id ON historial_navegacion(producto_id);
CREATE INDEX idx_historial_navegacion_updated_at ON historial_navegacion(updated_at DESC);

-- 2.5: Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_historial_navegacion_updated_at 
    BEFORE UPDATE ON historial_navegacion
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 2.6: Habilitar RLS
ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;

-- 2.7: Crear políticas RLS
CREATE POLICY "Usuarios pueden ver su historial" ON historial_navegacion
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar su historial" ON historial_navegacion
    FOR ALL USING (auth.uid()::text = usuario_id);

CREATE POLICY "Admins pueden ver todo el historial" ON historial_navegacion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text AND rol = 'admin'
        )
    );

-- ==========================================
-- PARTE 3: DIRECCIONES_USUARIO
-- ==========================================

-- 3.1: Deshabilitar RLS
ALTER TABLE direcciones_usuario DISABLE ROW LEVEL SECURITY;

-- 3.2: Eliminar políticas
DROP POLICY IF EXISTS "Usuarios pueden ver sus direcciones" ON direcciones_usuario;
DROP POLICY IF EXISTS "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario;

-- 3.3: Eliminar y recrear tabla
DROP TABLE IF EXISTS direcciones_usuario CASCADE;

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

-- 3.4: Crear índices
CREATE INDEX idx_direcciones_usuario_id ON direcciones_usuario(usuario_id);
CREATE INDEX idx_direcciones_predeterminada ON direcciones_usuario(es_predeterminada);

-- 3.5: Crear trigger para updated_at
CREATE TRIGGER update_direcciones_usuario_updated_at 
    BEFORE UPDATE ON direcciones_usuario
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 3.6: Crear función para asegurar dirección predeterminada
CREATE OR REPLACE FUNCTION asegurar_direccion_predeterminada()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.es_predeterminada = TRUE THEN
        UPDATE direcciones_usuario 
        SET es_predeterminada = FALSE 
        WHERE usuario_id = NEW.usuario_id 
            AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_direccion_predeterminada
    BEFORE INSERT OR UPDATE ON direcciones_usuario
    FOR EACH ROW 
    EXECUTE FUNCTION asegurar_direccion_predeterminada();

-- 3.7: Habilitar RLS
ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

-- 3.8: Crear políticas RLS
CREATE POLICY "Usuarios pueden ver sus direcciones" ON direcciones_usuario
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar sus direcciones" ON direcciones_usuario
    FOR ALL USING (auth.uid()::text = usuario_id);

-- ==========================================
-- PARTE 4: VERIFICACIÓN FINAL
-- ==========================================
SELECT 
    table_name,
    column_name,
    data_type,
    '✅ DESPUÉS (debería ser text)' as estado
FROM information_schema.columns
WHERE table_name IN ('historial_navegacion', 'direcciones_usuario')
    AND column_name = 'usuario_id'
ORDER BY table_name;

-- Verificar que las tablas existen y están vacías
SELECT 'historial_navegacion' as tabla, COUNT(*) as registros FROM historial_navegacion
UNION ALL
SELECT 'direcciones_usuario' as tabla, COUNT(*) as registros FROM direcciones_usuario;

-- ==========================================
-- ✅ SCRIPT COMPLETADO
-- ==========================================
SELECT '✅ Todas las tablas han sido actualizadas correctamente!' as resultado;
SELECT '⚠️  Los datos anteriores fueron eliminados' as advertencia;
SELECT '🎯 Ahora usuario_id es TEXT en todas las tablas' as confirmacion;
