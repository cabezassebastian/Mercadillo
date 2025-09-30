-- Script temporal para deshabilitar RLS en direcciones_usuario
-- Ejecutar en Supabase SQL Editor para testing

-- Deshabilitar RLS temporalmente
ALTER TABLE direcciones_usuario DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'direcciones_usuario';

-- NOTA: Recuerda volver a habilitar RLS después de confirmar que funciona:
-- ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;