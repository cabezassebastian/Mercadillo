-- 🔧 FIX ALTERNATIVO: Recrear tablas sin RLS temporal
-- Este script elimina RLS temporalmente para diagnosticar el problema

-- ==========================================
-- PARTE 1: RECREAR HISTORIAL_NAVEGACION SIN RLS
-- ==========================================

-- Eliminar completamente la tabla
DROP TABLE IF EXISTS historial_navegacion CASCADE;

-- Recrear la tabla con usuario_id como TEXT
CREATE TABLE historial_navegacion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    producto_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar foreign key a productos (NO a usuarios aún)
ALTER TABLE historial_navegacion
ADD CONSTRAINT fk_historial_producto
FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;

-- Crear índices
CREATE INDEX idx_historial_navegacion_usuario_id ON historial_navegacion(usuario_id);
CREATE INDEX idx_historial_navegacion_producto_id ON historial_navegacion(producto_id);
CREATE INDEX idx_historial_navegacion_updated_at ON historial_navegacion(updated_at DESC);

-- NO habilitar RLS por ahora (para testing)
-- ALTER TABLE historial_navegacion ENABLE ROW LEVEL SECURITY;

SELECT '✅ Tabla historial_navegacion recreada SIN RLS' as resultado;

-- ==========================================
-- PARTE 2: RECREAR DIRECCIONES_USUARIO SIN RLS
-- ==========================================

-- Eliminar completamente la tabla
DROP TABLE IF EXISTS direcciones_usuario CASCADE;

-- Recrear la tabla con usuario_id como TEXT
CREATE TABLE direcciones_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id TEXT NOT NULL,
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

-- Agregar foreign key a usuarios
ALTER TABLE direcciones_usuario
ADD CONSTRAINT fk_direcciones_usuario
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

-- Crear índices
CREATE INDEX idx_direcciones_usuario_id ON direcciones_usuario(usuario_id);
CREATE INDEX idx_direcciones_predeterminada ON direcciones_usuario(es_predeterminada);

-- NO habilitar RLS por ahora (para testing)
-- ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;

SELECT '✅ Tabla direcciones_usuario recreada SIN RLS' as resultado;

-- ==========================================
-- PARTE 3: VERIFICACIÓN
-- ==========================================

-- Verificar tipos de datos
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'text' THEN '✅ CORRECTO'
        ELSE '❌ INCORRECTO'
    END as estado
FROM information_schema.columns
WHERE table_name IN ('historial_navegacion', 'direcciones_usuario')
    AND column_name = 'usuario_id'
ORDER BY table_name;

-- Verificar que las tablas están vacías
SELECT 'historial_navegacion' as tabla, COUNT(*) as registros FROM historial_navegacion
UNION ALL
SELECT 'direcciones_usuario' as tabla, COUNT(*) as registros FROM direcciones_usuario;

-- ==========================================
-- RESUMEN
-- ==========================================
SELECT '✅ Tablas recreadas sin RLS para testing' as resultado;
SELECT '⚠️ RLS deshabilitado temporalmente - probar primero' as advertencia;
SELECT '🎯 Después de probar que funciona, ejecutar el script para habilitar RLS' as siguiente_paso;
