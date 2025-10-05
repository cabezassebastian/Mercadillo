-- Script para insertar un pedido de prueba con información de entrega
-- Ejecuta esto en el SQL Editor de Supabase

-- Primero, necesitas tu usuario_id de Clerk
-- Reemplaza 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK' con tu ID real de Clerk

-- Pedido 1: Envío a domicilio (Olva Courier)
INSERT INTO pedidos (
  usuario_id,
  items,
  subtotal,
  total,
  estado,
  metodo_pago,
  metodo_entrega,
  dni_cliente,
  nombre_completo,
  telefono_contacto,
  direccion_envio,
  notas_entrega
) VALUES (
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  '[{"id": "prod1", "nombre": "Producto de Prueba 1", "precio": 75.00, "cantidad": 2, "imagen": "https://via.placeholder.com/150"}]'::jsonb,
  150.00,
  150.00,
  'pendiente',
  'mercadopago',
  'envio',
  '12345678',
  'Juan Pérez García',
  '+51 987 654 321',
  'Av. Javier Prado 123, San Isidro, Lima',
  'Tocar el timbre del edificio azul, Dpto 301'
);

-- Pedido 2: Pago contra entrega - Tren Línea 1
INSERT INTO pedidos (
  usuario_id,
  items,
  subtotal,
  total,
  estado,
  metodo_pago,
  metodo_entrega,
  nombre_completo,
  telefono_contacto,
  direccion_envio,
  notas_entrega
) VALUES (
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  '[{"id": "prod2", "nombre": "Producto de Prueba 2", "precio": 44.95, "cantidad": 2, "imagen": "https://via.placeholder.com/150"}]'::jsonb,
  89.90,
  89.90,
  'pendiente',
  'efectivo',
  'contraentrega',
  'María López Sánchez',
  '+51 912 345 678',
  'Estación Villa El Salvador',
  'Estaré disponible después de las 6pm'
);

-- Pedido 3: Recojo en tienda
INSERT INTO pedidos (
  usuario_id,
  items,
  subtotal,
  total,
  estado,
  metodo_pago,
  metodo_entrega,
  nombre_completo,
  telefono_contacto,
  direccion_envio,
  notas_entrega
) VALUES (
  'user_32WWEmjUyEaZeFWSrcx17ZgG4UK',
  '[{"id": "prod3", "nombre": "Producto de Prueba 3", "precio": 45.50, "cantidad": 1, "imagen": "https://via.placeholder.com/150"}]'::jsonb,
  45.50,
  45.50,
  'pendiente',
  'mercadopago',
  'tienda',
  'Carlos Rodríguez Vega',
  '+51 956 789 012',
  'Recojo en tienda - Lima, Perú',
  'Prefiero recoger por la mañana entre 9-11am'
);

-- Para obtener tu usuario_id de Clerk, ejecuta primero:
-- SELECT id, email FROM usuarios LIMIT 5;
