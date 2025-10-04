-- FIX: Re-crear función validar_cupon con tipo NUMERIC correcto
-- Ejecuta esto en Supabase SQL Editor si tienes error 400

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS validar_cupon(VARCHAR, TEXT, DECIMAL);
DROP FUNCTION IF EXISTS validar_cupon(VARCHAR, TEXT, NUMERIC);

-- Crear función con tipo NUMERIC
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
  FROM cupones_usados cu
  WHERE cu.cupon_id = v_cupon.id AND cu.usuario_id = p_usuario_id;

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

-- Verificar que la función se creó correctamente
-- Debería devolver información sobre la función
SELECT proname, pronargs, proargtypes 
FROM pg_proc 
WHERE proname = 'validar_cupon';

-- Prueba simple: validar un cupón inexistente (debe devolver false)
SELECT * FROM validar_cupon('TEST123', 'user_test', 100.00);
