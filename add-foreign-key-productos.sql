-- 🔧 FIX: Agregar Foreign Key de lista_deseos → productos

-- El problema: Al recrear la tabla lista_deseos, perdimos la foreign key a productos
-- La solución: Agregar la constraint de foreign key

-- PASO 1: Verificar que la foreign key NO existe actualmente
SELECT 
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='lista_deseos';

-- PASO 2: Agregar la foreign key hacia productos
ALTER TABLE lista_deseos
ADD CONSTRAINT lista_deseos_producto_id_fkey 
FOREIGN KEY (producto_id) 
REFERENCES productos(id) 
ON DELETE CASCADE;

-- PASO 3: Verificar que la foreign key fue creada
SELECT 
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='lista_deseos';

-- ✅ Ahora Supabase podrá hacer el JOIN con productos en los SELECT
