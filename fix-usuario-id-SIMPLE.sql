-- 🔧 SCRIPT SIMPLE: Cambiar usuario_id de UUID a TEXT en lista_deseos
-- PASO A PASO para evitar errores

-- PASO 1: Ver el tipo actual
SELECT 
    table_name,
    column_name,
    data_type,
    'ANTES DEL CAMBIO' as momento
FROM information_schema.columns
WHERE table_name = 'lista_deseos'
    AND column_name = 'usuario_id';

-- PASO 2: Eliminar tabla lista_deseos (¡CUIDADO! Esto borra los datos)
DROP TABLE IF EXISTS lista_deseos CASCADE;

-- PASO 3: Recrear la tabla con usuario_id como TEXT
CREATE TABLE lista_deseos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    producto_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- PASO 4: Crear índices
CREATE INDEX idx_lista_deseos_usuario_id ON lista_deseos(usuario_id);
CREATE INDEX idx_lista_deseos_producto_id ON lista_deseos(producto_id);

-- PASO 5: Habilitar RLS
ALTER TABLE lista_deseos ENABLE ROW LEVEL SECURITY;

-- PASO 6: Crear políticas RLS
CREATE POLICY "Usuarios pueden ver su propia lista de deseos" ON lista_deseos
    FOR SELECT USING (auth.uid()::text = usuario_id);

CREATE POLICY "Usuarios pueden gestionar su lista de deseos" ON lista_deseos
    FOR ALL USING (auth.uid()::text = usuario_id);

-- PASO 7: Verificar que funcionó
SELECT 
    table_name,
    column_name,
    data_type,
    'DESPUES DEL CAMBIO ✅' as momento
FROM information_schema.columns
WHERE table_name = 'lista_deseos'
    AND column_name = 'usuario_id';

-- PASO 8: Probar inserción (reemplaza 'TU_USER_ID' con tu ID de Clerk)
-- DESCOMENTA las siguientes líneas SOLO para probar:
/*
INSERT INTO lista_deseos (usuario_id, producto_id)
VALUES (
    'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
    (SELECT id FROM productos LIMIT 1)
);

SELECT * FROM lista_deseos WHERE usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';
*/
