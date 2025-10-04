-- Migration: Sistema de Cupones de Descuento
-- Run this SQL in Supabase SQL Editor

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS cupones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('porcentaje', 'monto_fijo')),
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  usos_maximos INTEGER DEFAULT NULL,
  usos_actuales INTEGER DEFAULT 0,
  monto_minimo NUMERIC(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de uso de cupones
CREATE TABLE IF NOT EXISTS cupones_usados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cupon_id UUID REFERENCES cupones(id) ON DELETE CASCADE,
  usuario_id TEXT NOT NULL,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  descuento_aplicado NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);
CREATE INDEX IF NOT EXISTS idx_cupones_activo ON cupones(activo);
CREATE INDEX IF NOT EXISTS idx_cupones_usados_usuario ON cupones_usados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cupones_usados_cupon ON cupones_usados(cupon_id);

-- Función para validar cupón
CREATE OR REPLACE FUNCTION validar_cupon(
  p_codigo VARCHAR(50),
  p_usuario_id TEXT,
  p_subtotal NUMERIC
)
RETURNS TABLE(
  valido BOOLEAN,
  mensaje TEXT,
  cupon_id UUID,
  tipo VARCHAR(20),
  valor NUMERIC,
  descuento NUMERIC
) AS $$
DECLARE
  v_cupon RECORD;
  v_usos_usuario INTEGER;
  v_descuento NUMERIC;
BEGIN
  -- Buscar cupón
  SELECT * INTO v_cupon
  FROM cupones
  WHERE codigo = p_codigo AND activo = true;

  -- Cupón no existe o inactivo
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Cupón inválido o expirado'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;

  -- Verificar fecha de expiración
  IF v_cupon.fecha_expiracion IS NOT NULL AND v_cupon.fecha_expiracion < NOW() THEN
    RETURN QUERY SELECT false, 'Cupón expirado'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;

  -- Verificar usos máximos globales
  IF v_cupon.usos_maximos IS NOT NULL AND v_cupon.usos_actuales >= v_cupon.usos_maximos THEN
    RETURN QUERY SELECT false, 'Cupón agotado'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;

  -- Verificar si el usuario ya usó este cupón
  SELECT COUNT(*) INTO v_usos_usuario
  FROM cupones_usados
  WHERE cupon_id = v_cupon.id AND usuario_id = p_usuario_id;

  IF v_usos_usuario > 0 THEN
    RETURN QUERY SELECT false, 'Ya has usado este cupón'::TEXT, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;

  -- Verificar monto mínimo
  IF p_subtotal < v_cupon.monto_minimo THEN
    RETURN QUERY SELECT 
      false, 
      ('Compra mínima de S/ ' || v_cupon.monto_minimo || ' requerida')::TEXT, 
      NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;

  -- Calcular descuento
  IF v_cupon.tipo = 'porcentaje' THEN
    v_descuento := p_subtotal * (v_cupon.valor / 100);
  ELSE
    v_descuento := LEAST(v_cupon.valor, p_subtotal);
  END IF;

  -- Redondear a 2 decimales
  v_descuento := ROUND(v_descuento, 2);

  -- Cupón válido
  RETURN QUERY SELECT 
    true, 
    'Cupón aplicado exitosamente'::TEXT, 
    v_cupon.id, 
    v_cupon.tipo, 
    v_cupon.valor, 
    v_descuento;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar uso de cupón
CREATE OR REPLACE FUNCTION registrar_uso_cupon(
  p_cupon_id UUID,
  p_usuario_id TEXT,
  p_pedido_id UUID,
  p_descuento NUMERIC
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insertar en historial
  INSERT INTO cupones_usados (cupon_id, usuario_id, pedido_id, descuento_aplicado)
  VALUES (p_cupon_id, p_usuario_id, p_pedido_id, p_descuento);

  -- Incrementar contador de usos
  UPDATE cupones
  SET usos_actuales = usos_actuales + 1
  WHERE id = p_cupon_id;

  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON TABLE cupones IS 'Cupones de descuento para el ecommerce';
COMMENT ON COLUMN cupones.tipo IS 'Tipo: porcentaje (0-100) o monto_fijo (en soles)';
COMMENT ON COLUMN cupones.usos_maximos IS 'NULL = ilimitado';
COMMENT ON COLUMN cupones.monto_minimo IS 'Monto mínimo de compra para usar el cupón';

-- Insertar cupones de ejemplo (opcional)
INSERT INTO cupones (codigo, tipo, valor, descripcion, usos_maximos, monto_minimo, activo)
VALUES 
  ('BIENVENIDA10', 'porcentaje', 10, 'Descuento de bienvenida 10%', 100, 50, true),
  ('MERCADILLO20', 'porcentaje', 20, 'Descuento especial 20%', 50, 100, true),
  ('DESCUENTO5', 'monto_fijo', 5, 'S/ 5 de descuento', NULL, 20, true)
ON CONFLICT (codigo) DO NOTHING;
