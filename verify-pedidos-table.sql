-- 🔍 VERIFICAR TABLA PEDIDOS
-- Ejecutar para ver si hay algún problema con la tabla pedidos

-- ==========================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
-- ==========================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name = 'usuario_id' AND data_type = 'text' THEN '✅'
        WHEN column_name = 'usuario_id' AND data_type != 'text' THEN '❌'
        ELSE '  '
    END as estado
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- ==========================================
-- 2. VERIFICAR RLS
-- ==========================================
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '🔒 RLS Habilitado'
        WHEN rowsecurity = false THEN '🔓 RLS Deshabilitado'
    END as estado_rls
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename = 'pedidos';

-- ==========================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ==========================================
SELECT 
    policyname,
    cmd as operacion,
    qual as condicion
FROM pg_policies
WHERE tablename = 'pedidos'
ORDER BY policyname;

-- ==========================================
-- 4. PROBAR INSERCIÓN DE PRUEBA
-- ==========================================
-- DESCOMENTA PARA PROBAR
/*
INSERT INTO pedidos (
    usuario_id,
    items,
    subtotal,
    igv,
    total,
    direccion_envio,
    metodo_pago,
    mercadopago_external_reference
) VALUES (
    'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
    '[{"id":"test","title":"Test Product","price":100,"quantity":1,"image":""}]'::jsonb,
    100.00,
    18.00,
    118.00,
    'Dirección de prueba',
    'mercadopago',
    'order_test_123456'
);

-- Ver el pedido creado
SELECT * FROM pedidos WHERE usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';

-- Eliminar el pedido de prueba
DELETE FROM pedidos WHERE mercadopago_external_reference = 'order_test_123456';
*/

SELECT '✅ Verificación de tabla pedidos completada' as resultado;
