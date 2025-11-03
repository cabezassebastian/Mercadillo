-- Script de debugging para verificar acceso de admin con Clerk

-- 1. Ver el ID del usuario actual autenticado (probablemente NULL porque usamos Clerk)
SELECT auth.uid() AS supabase_user_id;

-- 2. Ver TODOS los usuarios en la tabla para encontrar tu ID de Clerk
SELECT 
  id,
  nombre,
  email,
  rol,
  created_at
FROM usuarios 
ORDER BY created_at DESC
LIMIT 10;

-- 3. IMPORTANTE: Copia tu ID de usuario de Clerk del paso 2
-- Debería ser algo como 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK'
-- Luego ejecuta esto REEMPLAZANDO 'TU_CLERK_USER_ID' con tu ID real:

-- UPDATE usuarios 
-- SET rol = 'admin' 
-- WHERE id = 'TU_CLERK_USER_ID';

-- Ejemplo:
-- UPDATE usuarios 
-- SET rol = 'admin' 
-- WHERE id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';

-- 4. Verificar que ahora eres admin (reemplaza con tu ID)
-- SELECT 
--   id,
--   nombre,
--   email,
--   rol
-- FROM usuarios 
-- WHERE id = 'TU_CLERK_USER_ID';

-- 5. Probar la función RPC manualmente
-- SELECT * FROM get_chat_analytics('2025-10-01T00:00:00Z'::timestamp with time zone);
