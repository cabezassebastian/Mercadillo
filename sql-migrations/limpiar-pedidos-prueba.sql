-- Borrar pedidos de prueba para volver a insertar con el script corregido
DELETE FROM pedidos 
WHERE usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK'
  AND mercadopago_preference_id LIKE 'test_pref_%';

-- Verificar que se borraron
SELECT COUNT(*) as pedidos_restantes
FROM pedidos 
WHERE usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK';
