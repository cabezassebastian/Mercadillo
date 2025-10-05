-- Migration: Create chat_conversations table for chatbot analytics
-- Run this SQL in Supabase SQL Editor

-- Crear tabla de conversaciones del chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id TEXT,
  mensaje TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  session_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_chat_usuario ON chat_conversations(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_conversations(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver solo sus propias conversaciones
CREATE POLICY "Users can view their own conversations"
ON chat_conversations
FOR SELECT
USING (auth.uid()::text = usuario_id);

-- Policy: El sistema (service role) puede insertar conversaciones
CREATE POLICY "Service role can insert conversations"
ON chat_conversations
FOR INSERT
WITH CHECK (true);

-- Policy: Admins pueden ver todas las conversaciones
CREATE POLICY "Admins can view all conversations"
ON chat_conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()::text
    AND rol = 'admin'
  )
);

-- Función para limpiar conversaciones antiguas (ejecutar manualmente o con cron)
CREATE OR REPLACE FUNCTION clean_old_chat_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_conversations
  WHERE timestamp < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios en la tabla
COMMENT ON TABLE chat_conversations IS 'Almacena todas las conversaciones del chatbot para analytics y mejora continua';
COMMENT ON COLUMN chat_conversations.usuario_id IS 'ID del usuario de Clerk, null si es anónimo';
COMMENT ON COLUMN chat_conversations.mensaje IS 'Mensaje enviado por el usuario';
COMMENT ON COLUMN chat_conversations.respuesta IS 'Respuesta generada por el bot';
COMMENT ON COLUMN chat_conversations.session_id IS 'ID de la sesión del chat para agrupar conversaciones';
COMMENT ON COLUMN chat_conversations.metadata IS 'Información adicional: modelo usado, tokens, etc.';
