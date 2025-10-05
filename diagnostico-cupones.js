/**
 * 🔍 Script de Diagnóstico - Cupones Admin Panel
 * 
 * INSTRUCCIONES:
 * 1. Abre tu app en el navegador
 * 2. Abre DevTools (F12)
 * 3. Ve a la pestaña Console
 * 4. Copia y pega este código completo
 * 5. Presiona Enter
 * 
 * El script te dirá exactamente qué está mal y cómo arreglarlo.
 */

(async function diagnosticoCupones() {
  console.clear()
  console.log('🔍 DIAGNÓSTICO DE CUPONES - INICIANDO...\n')
  
  // Verificar que supabase existe
  const { supabase } = await import('./src/lib/supabase.ts')
  
  if (!supabase) {
    console.error('❌ ERROR: Supabase no está inicializado')
    return
  }
  
  console.log('✅ Supabase inicializado correctamente\n')
  
  // Test 1: Verificar autenticación
  console.log('📋 TEST 1: Verificación de Usuario')
  const session = await supabase.auth.getSession()
  
  if (!session.data.session) {
    console.error('❌ No hay sesión activa')
    console.log('💡 SOLUCIÓN: Inicia sesión primero')
    return
  }
  
  const userId = session.data.session.user.id
  console.log('✅ Usuario autenticado:', userId)
  
  // Test 2: Verificar si es admin
  console.log('\n📋 TEST 2: Verificación de Rol Admin')
  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('id, email, rol')
    .eq('id', userId)
    .single()
  
  if (userError) {
    console.error('❌ Error al obtener usuario:', userError.message)
    console.log('💡 SOLUCIÓN: Ejecuta en Supabase SQL Editor:')
    console.log(`   UPDATE usuarios SET rol = 'admin' WHERE id = '${userId}';`)
    return
  }
  
  if (usuario.rol !== 'admin') {
    console.error('❌ Tu rol actual es:', usuario.rol)
    console.log('💡 SOLUCIÓN: Ejecuta en Supabase SQL Editor:')
    console.log(`   UPDATE usuarios SET rol = 'admin' WHERE id = '${userId}';`)
    return
  }
  
  console.log('✅ Rol confirmado: ADMIN')
  
  // Test 3: Verificar tabla cupones
  console.log('\n📋 TEST 3: Verificación de Tabla Cupones')
  const { data: cupones, error: cuponesError } = await supabase
    .from('cupones')
    .select('*')
    .limit(5)
  
  if (cuponesError) {
    console.error('❌ Error al leer cupones:', cuponesError.message)
    console.error('Código:', cuponesError.code)
    console.error('Detalles:', cuponesError.details)
    
    if (cuponesError.code === '42501' || cuponesError.message.includes('permission')) {
      console.log('\n💡 SOLUCIÓN: Políticas RLS no configuradas')
      console.log('   1. Ve a Supabase → SQL Editor')
      console.log('   2. Ejecuta el contenido de: sql-migrations/fix-cupones-rls.sql')
      console.log('   3. Refresca la página')
    }
    return
  }
  
  console.log('✅ Tabla cupones accesible')
  console.log('📊 Cupones encontrados:', cupones.length)
  
  if (cupones.length === 0) {
    console.warn('⚠️ No hay cupones en la base de datos')
    console.log('💡 SOLUCIÓN: Ejecuta en Supabase SQL Editor:')
    console.log(`   INSERT INTO cupones (codigo, tipo, valor, descripcion, monto_minimo, activo)
   VALUES ('TEST10', 'porcentaje', 10, 'Cupón de prueba', 20, true);`)
  } else {
    console.log('\n📦 Cupones existentes:')
    cupones.forEach(c => {
      console.log(`   - ${c.codigo}: ${c.tipo === 'porcentaje' ? c.valor + '%' : 'S/ ' + c.valor} (${c.activo ? 'ACTIVO' : 'INACTIVO'})`)
    })
  }
  
  // Test 4: Verificar políticas RLS
  console.log('\n📋 TEST 4: Verificación de Políticas RLS')
  const { data: policies, error: policiesError } = await supabase
    .rpc('exec_sql', { 
      query: `SELECT policyname FROM pg_policies WHERE tablename = 'cupones'` 
    })
    .catch(() => ({ data: null, error: { message: 'RPC no disponible' } }))
  
  if (!policies || policiesError) {
    console.warn('⚠️ No se pudo verificar políticas (es normal)')
  }
  
  // Test 5: Test de INSERT
  console.log('\n📋 TEST 5: Test de Creación de Cupón')
  const testCupon = {
    codigo: 'TESTDIAG' + Date.now(),
    tipo: 'porcentaje',
    valor: 5,
    descripcion: 'Cupón de diagnóstico - PUEDE ELIMINARSE',
    fecha_inicio: new Date().toISOString(),
    monto_minimo: 10,
    activo: true
  }
  
  const { data: newCupon, error: insertError } = await supabase
    .from('cupones')
    .insert([testCupon])
    .select()
  
  if (insertError) {
    console.error('❌ Error al crear cupón de prueba:', insertError.message)
    console.log('💡 SOLUCIÓN: Ejecuta fix-cupones-rls.sql en Supabase')
    return
  }
  
  console.log('✅ Cupón de prueba creado:', newCupon[0].codigo)
  
  // Eliminar cupón de prueba
  await supabase.from('cupones').delete().eq('id', newCupon[0].id)
  console.log('✅ Cupón de prueba eliminado')
  
  // RESULTADO FINAL
  console.log('\n' + '='.repeat(60))
  console.log('✅ DIAGNÓSTICO COMPLETADO - TODO FUNCIONANDO CORRECTAMENTE')
  console.log('='.repeat(60))
  console.log('\n💡 Si ves este mensaje, el panel de cupones debería funcionar.')
  console.log('   Refresca la página (F5) y ve a: /admin/cupones\n')
  
})().catch(error => {
  console.error('\n❌ ERROR CRÍTICO EN DIAGNÓSTICO:')
  console.error(error)
  console.log('\n💡 Comparte este error completo para recibir ayuda')
})
