-- 🔍 Script de verificación: Confirmar que usuario_id es TEXT

-- 1️⃣ Verificar tipo de columna usuario_id
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('lista_deseos', 'historial_navegacion', 'direcciones_usuario', 'usuarios')
    AND column_name IN ('usuario_id', 'id')
ORDER BY table_name, column_name;

-- 2️⃣ Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('lista_deseos', 'historial_navegacion', 'direcciones_usuario')
ORDER BY tablename, policyname;

-- 3️⃣ Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('lista_deseos', 'historial_navegacion', 'direcciones_usuario', 'usuarios')
ORDER BY tablename;

-- 4️⃣ Intentar insertar un registro de prueba (comentado por seguridad)
-- Descomenta las siguientes líneas SOLO si quieres probar la inserción
-- IMPORTANTE: Reemplaza 'user_TU_ID_DE_CLERK' con tu ID real de Clerk

/*
-- Primero asegúrate de que exista el usuario en la tabla usuarios
INSERT INTO usuarios (id, email, nombre, apellido, rol)
VALUES ('user_32WWEmjUyEaZeFWSrcx17ZgG4UK', 'test@example.com', 'Test', 'User', 'cliente')
ON CONFLICT (id) DO NOTHING;

-- Intentar insertar en lista_deseos (necesitas un producto_id válido)
INSERT INTO lista_deseos (usuario_id, producto_id)
SELECT 
    'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
    id
FROM productos
LIMIT 1
ON CONFLICT (usuario_id, producto_id) DO NOTHING;

-- Verificar la inserción
SELECT * FROM lista_deseos WHERE usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';
*/

-- 5️⃣ Ver estructura completa de las tablas
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    tc.constraint_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN information_schema.key_column_usage kcu ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
LEFT JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
WHERE t.table_name IN ('lista_deseos', 'historial_navegacion', 'direcciones_usuario')
    AND t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;
