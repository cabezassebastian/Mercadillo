-- Script de debugging para verificar acceso de admin

-- 1. Ver el ID del usuario actual autenticado
SELECT auth.uid() AS mi_user_id;

-- 2. Verificar si existe en la tabla usuarios
SELECT 
  id,
  nombre,
  email,
  rol,
  created_at
FROM usuarios 
WHERE id = auth.uid()::text;

-- 3. Si no existe o no es admin, créalo/actualízalo
-- EJECUTA ESTO si el paso 2 no devuelve nada o el rol no es 'admin'
INSERT INTO usuarios (id, nombre, email, rol)
VALUES (
  auth.uid()::text,
  'Admin User',
  'admin@mercadillo.app',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET rol = 'admin';

-- 4. Verificar de nuevo
SELECT 
  id,
  nombre,
  email,
  rol
FROM usuarios 
WHERE id = auth.uid()::text;

-- 5. Probar la función RPC manualmente
SELECT * FROM get_chat_analytics('2025-10-01T00:00:00Z'::timestamp with time zone);
