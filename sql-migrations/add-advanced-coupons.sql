-- ============================================================================
-- MIGRACIÓN: Sistema de Cupones Avanzados
-- Fecha: 5 de noviembre de 2025
-- Descripción: Agregar funcionalidades avanzadas al sistema de cupones
-- ============================================================================

-- 1. Agregar nuevas columnas a la tabla cupones
ALTER TABLE cupones 
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS only_first_purchase BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS veces_usado INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_descuento_aplicado DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tipo_cupon TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS es_cumpleanos BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS es_carrito_abandonado BOOLEAN DEFAULT FALSE;

-- 2. Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN cupones.categoria IS 'Categoría específica a la que aplica el cupón (NULL = todas)';
COMMENT ON COLUMN cupones.only_first_purchase IS 'Si TRUE, solo válido para primera compra del usuario';
COMMENT ON COLUMN cupones.referred_by IS 'User ID del usuario que refirió (sistema de referidos)';
COMMENT ON COLUMN cupones.veces_usado IS 'Contador de veces que se ha usado el cupón';
COMMENT ON COLUMN cupones.total_descuento_aplicado IS 'Total acumulado de descuentos aplicados con este cupón';
COMMENT ON COLUMN cupones.tipo_cupon IS 'Tipo: general, primera_compra, cumpleanos, carrito_abandonado, referido';
COMMENT ON COLUMN cupones.es_cumpleanos IS 'Si es cupón de cumpleaños automático';
COMMENT ON COLUMN cupones.es_carrito_abandonado IS 'Si es cupón de recuperación de carrito abandonado';

-- 3. Crear tabla para trackear códigos de referidos por usuario
CREATE TABLE IF NOT EXISTS codigos_referidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id TEXT UNIQUE NOT NULL,
  codigo_referido TEXT UNIQUE NOT NULL,
  referidos_total INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_cupones_categoria ON cupones(categoria) WHERE categoria IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cupones_tipo ON cupones(tipo_cupon);
CREATE INDEX IF NOT EXISTS idx_cupones_cumpleanos ON cupones(es_cumpleanos) WHERE es_cumpleanos = TRUE;
CREATE INDEX IF NOT EXISTS idx_cupones_referred_by ON cupones(referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_codigos_referidos_codigo ON codigos_referidos(codigo_referido);
CREATE INDEX IF NOT EXISTS idx_codigos_referidos_usuario ON codigos_referidos(usuario_id);

-- 5. Crear tabla para historial de uso de cupones (mejorado)
CREATE TABLE IF NOT EXISTS cupones_usados_historial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cupon_id UUID REFERENCES cupones(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL,
  descuento_aplicado DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cupones_usados_cupon ON cupones_usados_historial(cupon_id);
CREATE INDEX IF NOT EXISTS idx_cupones_usados_usuario ON cupones_usados_historial(usuario_id);

-- 6. Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code(user_id TEXT)
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
  existe BOOLEAN;
BEGIN
  -- Generar código base a partir del user_id
  codigo := 'REF' || UPPER(SUBSTRING(MD5(user_id) FROM 1 FOR 6));
  
  -- Verificar si existe
  SELECT EXISTS(SELECT 1 FROM codigos_referidos WHERE codigo_referido = codigo) INTO existe;
  
  -- Si existe, agregar números aleatorios
  WHILE existe LOOP
    codigo := 'REF' || UPPER(SUBSTRING(MD5(user_id || RANDOM()::TEXT) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM codigos_referidos WHERE codigo_referido = codigo) INTO existe;
  END LOOP;
  
  RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para actualizar estadísticas cuando se usa un cupón
CREATE OR REPLACE FUNCTION actualizar_estadisticas_cupon()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar contador de veces usado
  UPDATE cupones 
  SET veces_usado = veces_usado + 1,
      total_descuento_aplicado = total_descuento_aplicado + NEW.descuento_aplicado
  WHERE id = NEW.cupon_id;
  
  -- Si es un cupón de referido, actualizar contador del referidor
  UPDATE codigos_referidos
  SET referidos_total = referidos_total + 1,
      updated_at = NOW()
  WHERE usuario_id = (
    SELECT referred_by FROM cupones WHERE id = NEW.cupon_id AND referred_by IS NOT NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_cupon ON cupones_usados_historial;
CREATE TRIGGER trigger_actualizar_estadisticas_cupon
AFTER INSERT ON cupones_usados_historial
FOR EACH ROW
EXECUTE FUNCTION actualizar_estadisticas_cupon();

-- 8. Trigger para actualizar updated_at en codigos_referidos
CREATE OR REPLACE FUNCTION actualizar_timestamp_referidos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_referidos ON codigos_referidos;
CREATE TRIGGER trigger_actualizar_timestamp_referidos
BEFORE UPDATE ON codigos_referidos
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_referidos();

-- 9. RLS Policies para codigos_referidos
ALTER TABLE codigos_referidos ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver códigos de referidos
CREATE POLICY "Códigos de referidos son públicos"
ON codigos_referidos FOR SELECT
USING (true);

-- Solo el dueño puede insertar/actualizar su código
CREATE POLICY "Usuarios pueden crear su propio código"
ON codigos_referidos FOR INSERT
WITH CHECK (auth.uid()::TEXT = usuario_id);

CREATE POLICY "Usuarios pueden actualizar su propio código"
ON codigos_referidos FOR UPDATE
USING (auth.uid()::TEXT = usuario_id);

-- 10. RLS Policies para cupones_usados_historial
ALTER TABLE cupones_usados_historial ENABLE ROW LEVEL SECURITY;

-- Solo el usuario puede ver su historial
CREATE POLICY "Ver propio historial de cupones"
ON cupones_usados_historial FOR SELECT
USING (auth.uid()::TEXT = usuario_id);

-- Sistema puede insertar (desde backend)
CREATE POLICY "Sistema puede insertar historial"
ON cupones_usados_historial FOR INSERT
WITH CHECK (true);

-- 11. Función para obtener código de referido de un usuario (crear si no existe)
CREATE OR REPLACE FUNCTION obtener_codigo_referido(user_id TEXT)
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
BEGIN
  -- Intentar obtener código existente
  SELECT codigo_referido INTO codigo
  FROM codigos_referidos
  WHERE usuario_id = user_id;
  
  -- Si no existe, crear uno nuevo
  IF codigo IS NULL THEN
    codigo := generate_referral_code(user_id);
    INSERT INTO codigos_referidos (usuario_id, codigo_referido)
    VALUES (user_id, codigo);
  END IF;
  
  RETURN codigo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Función para validar si un cupón aplica a una categoría
CREATE OR REPLACE FUNCTION cupon_aplica_categoria(
  cupon_id UUID,
  producto_categoria TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  cupon_categoria TEXT;
BEGIN
  SELECT categoria INTO cupon_categoria
  FROM cupones
  WHERE id = cupon_id;
  
  -- Si el cupón no tiene categoría específica, aplica a todas
  IF cupon_categoria IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Si coincide la categoría, aplica
  RETURN cupon_categoria = producto_categoria;
END;
$$ LANGUAGE plpgsql;

-- 13. Función para validar si es primera compra de un usuario
CREATE OR REPLACE FUNCTION es_primera_compra(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM pedidos 
    WHERE usuario_id = user_id 
    AND estado != 'cancelado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Crear vista para estadísticas de cupones (útil para admin)
CREATE OR REPLACE VIEW cupones_estadisticas AS
SELECT 
  c.id,
  c.codigo,
  c.tipo_cupon,
  c.tipo,
  c.valor,
  c.veces_usado,
  c.total_descuento_aplicado,
  c.usos_maximos,
  CASE 
    WHEN c.usos_maximos IS NULL THEN NULL
    ELSE ROUND((c.veces_usado::DECIMAL / c.usos_maximos) * 100, 2)
  END as porcentaje_uso,
  c.fecha_inicio,
  c.fecha_expiracion,
  CASE
    WHEN c.fecha_expiracion IS NOT NULL AND c.fecha_expiracion < NOW() THEN 'Expirado'
    WHEN c.usos_maximos IS NOT NULL AND c.veces_usado >= c.usos_maximos THEN 'Agotado'
    WHEN c.fecha_inicio > NOW() THEN 'Programado'
    ELSE 'Activo'
  END as estado_actual,
  c.es_cumpleanos,
  c.es_carrito_abandonado,
  c.only_first_purchase,
  c.categoria,
  c.created_at
FROM cupones c
ORDER BY c.created_at DESC;

-- 15. Grant permissions para funciones
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION obtener_codigo_referido(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cupon_aplica_categoria(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION es_primera_compra(TEXT) TO authenticated, anon;

-- 16. Grant SELECT en la vista
GRANT SELECT ON cupones_estadisticas TO authenticated;

-- ============================================================================
-- DATOS DE EJEMPLO (Opcional - comentar en producción)
-- ============================================================================

-- Cupón de primera compra automático
/*
INSERT INTO cupones (codigo, tipo, valor, tipo_cupon, only_first_purchase, fecha_inicio, fecha_expiracion, usos_maximos, activo)
VALUES ('BIENVENIDO10', 'porcentaje', 10, 'primera_compra', TRUE, NOW(), NOW() + INTERVAL '1 year', NULL, true);

-- Cupón por categoría (ejemplo: Ropa)
INSERT INTO cupones (codigo, tipo, valor, tipo_cupon, categoria, fecha_inicio, fecha_expiracion, activo)
VALUES ('ROPA20', 'porcentaje', 20, 'general', 'Ropa', NOW(), NOW() + INTERVAL '30 days', true);

-- Cupón de cumpleaños (ejemplo)
INSERT INTO cupones (codigo, tipo, valor, tipo_cupon, es_cumpleanos, fecha_inicio, fecha_expiracion, usos_maximos, activo)
VALUES ('CUMPLE2024', 'monto_fijo', 50, 'cumpleanos', TRUE, NOW(), NOW() + INTERVAL '7 days', 1, true);
*/

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
