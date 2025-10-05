-- Migración: Agregar campo DNI a la tabla de usuarios
-- Fecha: 2025-10-05
-- Descripción: Agrega el campo dni a la tabla usuarios para almacenar el documento de identidad

-- Agregar columna DNI a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS dni VARCHAR(8);

-- Crear índice para búsquedas rápidas por DNI
CREATE INDEX IF NOT EXISTS idx_usuarios_dni ON usuarios(dni);

-- Comentario en la columna
COMMENT ON COLUMN usuarios.dni IS 'Documento Nacional de Identidad (DNI) del usuario - 8 dígitos';
