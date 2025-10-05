-- Script para verificar si el usuario existe en la tabla usuarios
-- Ejecuta esto en el SQL Editor de Supabase

-- Verificar si el usuario existe
SELECT id, email, nombre, apellido, created_at 
FROM usuarios 
WHERE id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';

-- Si no aparece nada, necesitas crear el usuario primero:
-- INSERT INTO usuarios (id, email, nombre, apellido)
-- VALUES ('user_32WWEmjUyEaZeFWSrcx17ZgG4UK', 'tu-email@ejemplo.com', 'Tu Nombre', 'Tu Apellido');
