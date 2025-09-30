-- Script para eliminar temporalmente RLS y permitir todas las operaciones
-- Esto nos ayudará a confirmar si el problema es de autenticación
-- TEMPORAL - Solo para diagnóstico

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE direcciones_usuario DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que se deshabilitó
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'direcciones_usuario';

-- Debería mostrar: direcciones_usuario | f (false)

-- 3. Ahora intenta crear una dirección desde la app
-- Si funciona, el problema es de autenticación RLS
-- Si no funciona, hay otro problema

-- NOTA: Recuerda volver a habilitar RLS después del test:
-- ALTER TABLE direcciones_usuario ENABLE ROW LEVEL SECURITY;