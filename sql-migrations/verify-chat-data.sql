-- Script para verificar datos en chat_conversations
-- Ejecuta esto en Supabase SQL Editor para diagnosticar el problema

-- 1. Verificar que la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'chat_conversations'
) AS table_exists;

-- 2. Contar total de registros
SELECT COUNT(*) AS total_conversations FROM chat_conversations;

-- 3. Ver las últimas 10 conversaciones
SELECT 
  id,
  usuario_id,
  LEFT(mensaje, 50) AS mensaje_preview,
  created_at,
  metadata
FROM chat_conversations
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar rango de fechas
SELECT 
  MIN(created_at) AS fecha_mas_antigua,
  MAX(created_at) AS fecha_mas_reciente,
  COUNT(*) AS total
FROM chat_conversations;

-- 5. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'chat_conversations';

-- 6. Verificar si RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'chat_conversations';

-- 7. Contar conversaciones por día (últimos 90 días)
SELECT 
  DATE(created_at) AS fecha,
  COUNT(*) AS conversaciones
FROM chat_conversations
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;

-- 8. Verificar usuarios únicos
SELECT 
  COUNT(DISTINCT usuario_id) AS usuarios_unicos,
  COUNT(CASE WHEN usuario_id IS NULL THEN 1 END) AS usuarios_anonimos
FROM chat_conversations;

-- 9. Insertar datos de prueba si la tabla está vacía
-- SOLO ejecutar si no hay datos
INSERT INTO chat_conversations (usuario_id, mensaje, respuesta, session_id, metadata)
VALUES 
  ('user_test', 'Hola, ¿qué productos tienes?', 'Hola! Tenemos productos de electrónicos, ropa, hogar y más.', 'session_test', '{"model": "gemini-2.0-flash"}'),
  ('user_test', 'Busca laptops', 'Aquí están nuestras laptops disponibles...', 'session_test', '{"model": "gemini-2.0-flash", "productsFound": 3}'),
  (NULL, '¿Hacen envíos?', 'Sí, hacemos envíos a todo Lima.', 'session_anon', '{"model": "gemini-2.0-flash"}')
ON CONFLICT DO NOTHING;

-- 10. Verificar que se insertaron
SELECT COUNT(*) FROM chat_conversations WHERE usuario_id = 'user_test';
