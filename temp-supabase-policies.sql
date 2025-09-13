-- Script para permitir operaciones directas en usuarios sin JWT válido
-- Ejecutar en Supabase SQL Editor

-- Deshabilitar RLS temporalmente para usuarios (solo para desarrollo/testing)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS habilitado, crear políticas más permisivas:
-- DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
-- DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
-- DROP POLICY IF EXISTS "Admins pueden ver todos los usuarios" ON usuarios;

-- Política permisiva para operaciones de usuarios (temporal)
-- CREATE POLICY "Permitir operaciones directas en usuarios" ON usuarios
--     FOR ALL USING (true);

-- Nota: En producción, deberías usar políticas más restrictivas y configurar
-- correctamente el JWT de Clerk para Supabase
