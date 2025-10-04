const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Leer .env.local manualmente
const envContent = fs.readFileSync('.env.local', 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabase = createClient(
  envVars.VITE_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
)

async function diagnoseRLS() {
  console.log('\n🔐 DIAGNÓSTICO DE POLÍTICAS RLS\n')
  
  // 1. Verificar tu usuario admin
  console.log('📊 Paso 1: Verificando tu usuario admin...')
  const { data: adminUser, error: adminError } = await supabase
    .from('usuarios')
    .select('id, email, nombre, rol')
    .eq('email', 'leehoon082@gmail.com')
    .single()

  if (adminError) {
    console.error('❌ Error:', adminError.message)
    return
  }

  console.log('✅ Usuario encontrado:')
  console.log(`   Email: ${adminUser.email}`)
  console.log(`   Nombre: ${adminUser.nombre}`)
  console.log(`   Rol: ${adminUser.rol}`)
  console.log(`   ID: ${adminUser.id}`)
  console.log('')

  // 2. Verificar políticas RLS actuales
  console.log('📊 Paso 2: Saltando verificación de políticas (requiere función personalizada)...')
  console.log('')

  // 3. Probar inserción con Service Role Key
  console.log('📊 Paso 3: Probando inserción con Service Role Key...')
  const testProduct = {
    nombre: 'TEST - Producto Admin',
    descripcion: 'Producto de prueba para verificar políticas RLS',
    precio: 99.99,
    stock: 5,
    categoria: 'Otros',
    imagen: 'https://via.placeholder.com/400',
    activo: true
  }

  const { data: inserted, error: insertError } = await supabase
    .from('productos')
    .insert([testProduct])
    .select()

  if (insertError) {
    console.error('❌ Error al insertar:', insertError.message)
    console.error('   Código:', insertError.code)
    console.error('   Detalles:', insertError.details)
  } else {
    console.log('✅ Inserción exitosa con Service Role!')
    console.log(`   ID del producto: ${inserted[0].id}`)
    
    // Limpiar producto de prueba
    await supabase.from('productos').delete().eq('id', inserted[0].id)
    console.log('   (Producto de prueba eliminado)')
  }
  console.log('')

  // 4. Verificar RLS está habilitado
  console.log('📊 Paso 4: Saltando verificación de RLS (requiere permisos especiales)...')
  console.log('')

  console.log('🔍 ANÁLISIS:\n')
  console.log('El error "row-level security policy" significa que:')
  console.log('1. ✅ RLS está habilitado (correcto)')
  console.log('2. ❌ Las políticas RLS bloquean tu inserción desde el cliente')
  console.log('3. ❌ El cliente autenticado NO está enviando el JWT correcto')
  console.log('   O las políticas RLS no reconocen tu rol admin')
  console.log('')

  console.log('💡 SOLUCIÓN:\n')
  console.log('1. Ejecuta fix-admin-rls-policies.sql en Supabase SQL Editor')
  console.log('2. Verifica que incluya estas políticas:')
  console.log('   - "Admins pueden insertar productos" (FOR INSERT)')
  console.log('   - "Admins pueden actualizar productos" (FOR UPDATE)')
  console.log('   - "Admins pueden eliminar productos" (FOR DELETE)')
  console.log('3. Las políticas DEBEN verificar:')
  console.log('   EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid()::text AND rol = \'admin\')')
  console.log('4. Después de ejecutar el SQL, recarga la página web (F5)')
  console.log('')

  console.log('⚠️  PROBLEMA CONOCIDO:\n')
  console.log('El cliente supabaseAuthenticatedClient usa el JWT de Clerk.')
  console.log('Este JWT debe contener auth.uid() que coincida con usuarios.id')
  console.log('Si el JWT no tiene el claim correcto, las políticas RLS fallarán.')
  console.log('')

  console.log('✅ Diagnóstico completo\n')
}

diagnoseRLS().catch(console.error)
