-- 🔍 VERIFICACIÓN COMPLETA DEL ESQUEMA DE LA BASE DE DATOS
-- Ejecutar en Supabase SQL Editor para diagnosticar el problema

-- ==========================================
-- 1. VERIFICAR TIPO DE DATOS DE usuario_id
-- ==========================================
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    CASE 
        WHEN data_type = 'text' THEN '✅ CORRECTO'
        WHEN data_type = 'uuid' THEN '❌ INCORRECTO (debe ser text)'
        ELSE '⚠️ DESCONOCIDO'
    END as estado
FROM information_schema.columns
WHERE table_name IN ('usuarios', 'lista_deseos', 'historial_navegacion', 'direcciones_usuario')
    AND column_name = 'usuario_id'
ORDER BY table_name;

-- ==========================================
-- 2. VERIFICAR QUE LAS TABLAS EXISTEN
-- ==========================================
SELECT 
    tablename as tabla,
    schemaname as esquema,
    CASE 
        WHEN tablename IN ('historial_navegacion', 'direcciones_usuario') THEN '✅ Existe'
        ELSE '⚠️ Verificar'
    END as estado
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('historial_navegacion', 'direcciones_usuario', 'lista_deseos')
ORDER BY tablename;

-- ==========================================
-- 3. VERIFICAR FOREIGN KEYS
-- ==========================================
SELECT
    tc.table_name as tabla,
    kcu.column_name as columna,
    ccu.table_name AS tabla_referenciada,
    ccu.column_name AS columna_referenciada,
    '✅ FK configurado' as estado
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('historial_navegacion', 'direcciones_usuario')
    AND kcu.column_name = 'usuario_id';

-- ==========================================
-- 4. VERIFICAR POLÍTICAS RLS
-- ==========================================
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'SELECT' THEN '👁️ Ver'
        WHEN cmd = 'INSERT' THEN '➕ Insertar'
        WHEN cmd = 'UPDATE' THEN '✏️ Actualizar'
        WHEN cmd = 'DELETE' THEN '🗑️ Eliminar'
        WHEN cmd = '*' THEN '🔓 Todo'
        ELSE cmd
    END as operacion,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ Política activa'
        ELSE '❌ Sin política'
    END as estado
FROM pg_policies
WHERE tablename IN ('historial_navegacion', 'direcciones_usuario')
ORDER BY tablename, policyname;

-- ==========================================
-- 5. VERIFICAR ÍNDICES
-- ==========================================
SELECT
    tablename,
    indexname,
    indexdef,
    '✅ Índice creado' as estado
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('historial_navegacion', 'direcciones_usuario')
ORDER BY tablename, indexname;

-- ==========================================
-- 6. INTENTAR INSERCIÓN DE PRUEBA
-- ==========================================
-- Primero verificar que existe un producto
SELECT 
    'productos' as tabla,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Hay productos para probar'
        ELSE '❌ No hay productos'
    END as estado
FROM productos;

-- ==========================================
-- 7. PROBAR INSERCIÓN REAL (COMENTADO - DESCOMENTAR PARA PROBAR)
-- ==========================================
/*
-- DESCOMENTA ESTO PARA PROBAR UNA INSERCIÓN REAL
DO $$
DECLARE
    v_producto_id UUID;
    v_usuario_id TEXT := 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';
BEGIN
    -- Obtener un producto existente
    SELECT id INTO v_producto_id FROM productos LIMIT 1;
    
    IF v_producto_id IS NULL THEN
        RAISE NOTICE '❌ No hay productos en la base de datos';
        RETURN;
    END IF;
    
    -- Intentar insertar en historial
    INSERT INTO historial_navegacion (usuario_id, producto_id)
    VALUES (v_usuario_id, v_producto_id);
    
    RAISE NOTICE '✅ Inserción exitosa en historial_navegacion';
    
    -- Limpiar la prueba
    DELETE FROM historial_navegacion WHERE usuario_id = v_usuario_id;
    
    RAISE NOTICE '✅ Prueba completada y limpiada';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;
*/

-- ==========================================
-- RESUMEN FINAL
-- ==========================================
SELECT '🔍 Verificación completada - revisa los resultados arriba' as mensaje;
