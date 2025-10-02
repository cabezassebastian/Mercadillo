-- 🔍 DIAGNÓSTICO COMPLETO: ¿Dónde está la tabla lista_deseos?

-- 1️⃣ Ver TODAS las tablas lista_deseos en TODOS los schemas
SELECT 
    table_schema,
    table_name,
    'Tabla encontrada en este schema' as nota
FROM information_schema.tables
WHERE table_name = 'lista_deseos'
ORDER BY table_schema;

-- 2️⃣ Ver el tipo de usuario_id en CADA schema
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'lista_deseos'
    AND column_name = 'usuario_id'
ORDER BY table_schema;

-- 3️⃣ Ver la definición COMPLETA de la tabla en schema PUBLIC
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'lista_deseos'
ORDER BY ordinal_position;

-- 4️⃣ Ver si hay VIEWS que puedan estar interfiriendo
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name LIKE '%lista%'
    OR table_name LIKE '%wishlist%'
ORDER BY table_schema, table_name;

-- 5️⃣ Comprobar el SEARCH PATH actual
SHOW search_path;

-- 6️⃣ Ver las políticas RLS de la tabla public.lista_deseos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'lista_deseos'
ORDER BY schemaname, policyname;
