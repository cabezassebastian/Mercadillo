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

async function checkAdminAccess() {
  console.log('\n🔐 DIAGNÓSTICO DE ACCESO ADMIN\n')
  
  // Obtener tu Clerk ID
  console.log('📋 PASO 1: Identifica tu Clerk User ID')
  console.log('   Ve a Clerk Dashboard → Users → Copia tu User ID')
  console.log('   Debe empezar con "user_..."')
  console.log('')
  
  // Verificar usuarios en Supabase
  console.log('📊 PASO 2: Verificando usuarios en Supabase...')
  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('id, email, nombre, apellido, rol')
    .limit(10)
  
  if (usuariosError) {
    console.error('❌ Error al obtener usuarios:', usuariosError.message)
    return
  }
  
  console.log(`✅ Total usuarios encontrados: ${usuarios?.length || 0}`)
  if (usuarios && usuarios.length > 0) {
    console.log('\n👥 Usuarios registrados:')
    usuarios.forEach((u, i) => {
      const isAdmin = u.rol === 'admin' ? '👑 ADMIN' : '👤 Cliente'
      console.log(`   ${i + 1}. ${isAdmin} - ${u.nombre} ${u.apellido} (${u.email})`)
      console.log(`      ID: ${u.id}`)
      console.log(`      Rol: ${u.rol}`)
      console.log('')
    })
  } else {
    console.log('⚠️  No hay usuarios registrados en Supabase aún')
    console.log('   Debes iniciar sesión al menos una vez en la app para que se cree tu usuario')
  }
  
  console.log('\n🔧 PASO 3: ¿Cómo arreglar el acceso admin?')
  console.log('')
  console.log('OPCIÓN 1: Actualizar directamente en Supabase (RECOMENDADO)')
  console.log('   1. Ve a Supabase Dashboard → Table Editor → usuarios')
  console.log('   2. Busca tu usuario por email')
  console.log('   3. Edita la columna "rol" → Cambia de "cliente" a "admin"')
  console.log('   4. Guarda los cambios')
  console.log('   5. Recarga la página en tu navegador')
  console.log('')
  
  console.log('OPCIÓN 2: Ejecutar SQL en Supabase')
  console.log('   Ve a Supabase → SQL Editor y ejecuta:')
  console.log('')
  console.log('   UPDATE usuarios')
  console.log('   SET rol = \'admin\'')
  console.log('   WHERE email = \'TU_EMAIL@AQUI.COM\';')
  console.log('')
  
  console.log('OPCIÓN 3: Usar este script automático (necesitas tu Clerk ID)')
  console.log('   Descomentar la sección UPDATE_ADMIN_ROLE abajo')
  console.log('')
  
  // ACTUALIZAR ROL A ADMIN AUTOMÁTICAMENTE
  console.log('🔄 ACTUALIZANDO ROL A ADMIN...')
  const YOUR_EMAIL = 'leehoon082@gmail.com'
  
  const { data: updated, error: updateError } = await supabase
    .from('usuarios')
    .update({ rol: 'admin' })
    .eq('email', YOUR_EMAIL)
    .select()
  
  if (updateError) {
    console.error('❌ Error al actualizar:', updateError.message)
  } else if (updated && updated.length > 0) {
    console.log('✅ ¡ROL ACTUALIZADO EXITOSAMENTE!')
    console.log(`   Usuario: ${updated[0]?.nombre} ${updated[0]?.apellido}`)
    console.log(`   Email: ${updated[0]?.email}`)
    console.log(`   Nuevo rol: ${updated[0]?.rol}`)
    console.log('')
    console.log('🎉 Ahora tienes acceso de administrador!')
    console.log('   Recarga la página web (Ctrl+R o F5) para que los cambios tomen efecto')
  } else {
    console.log('⚠️  No se encontró usuario con ese email')
  }
  console.log('')
  
  console.log('\n⚠️  NOTA IMPORTANTE:')
  console.log('   - Clerk metadata NO se usa para verificar admin')
  console.log('   - La app verifica el rol desde la tabla "usuarios" de Supabase')
  console.log('   - Debes cambiar el rol en Supabase, no en Clerk')
  console.log('')
  
  console.log('✅ Diagnóstico completo\n')
}

checkAdminAccess().catch(console.error)
