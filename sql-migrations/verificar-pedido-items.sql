-- Verificar qué se guardó exactamente en el pedido
SELECT 
  id,
  created_at,
  items
FROM pedidos
WHERE usuario_id = 'user_32WWEmjUyEaZeFWSrcx17ZgG4UK'
ORDER BY created_at DESC
LIMIT 1;
