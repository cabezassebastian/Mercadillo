-- Script para crear tu usuario en la tabla usuarios
-- Ejecuta esto en el SQL Editor de Supabase
-- Reemplaza el email, nombre y apellido con tus datos reales

INSERT INTO usuarios (id, email, nombre, apellido)
VALUES (
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  'tu-email@ejemplo.com',  -- Cambia esto por tu email real
  'Tu Nombre',              -- Cambia esto por tu nombre
  'Tu Apellido'             -- Cambia esto por tu apellido
)
ON CONFLICT (id) DO NOTHING;

-- Verificar que se creó correctamente:
SELECT id, email, nombre, apellido FROM usuarios WHERE id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';
