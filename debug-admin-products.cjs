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

async function testAdminOperations() {
  console.log('\n🔧 DIAGNÓSTICO DE OPERACIONES ADMIN\n')
  
  // Test 1: Verificar políticas RLS en tabla productos
  console.log('📊 Test 1: Saltando verificación de políticas (requiere permisos especiales)...')
  console.log('')

  // Test 2: Intentar insertar producto de prueba
  console.log('📊 Test 2: Intentando insertar producto de prueba...')
  const testProduct = {
    nombre: 'TEST PRODUCTO - BORRAR',
    descripcion: 'Producto de prueba para diagnóstico',
    precio: 99.99,
    stock: 10,
    categoria: 'Otros',
    imagen: 'https://via.placeholder.com/400',
    activo: true
  }

  const { data: insertedProduct, error: insertError } = await supabase
    .from('productos')
    .insert([testProduct])
    .select()

  if (insertError) {
    console.error('   ❌ Error al insertar:', insertError.message)
    console.error('   Código:', insertError.code)
    console.error('   Detalles:', insertError.details)
    console.error('   Hint:', insertError.hint)
  } else {
    console.log('   ✅ Producto insertado exitosamente!')
    console.log('   ID:', insertedProduct[0]?.id)
    
    // Test 3: Intentar actualizar
    console.log('\n📊 Test 3: Intentando actualizar producto...')
    const { data: updatedProduct, error: updateError } = await supabase
      .from('productos')
      .update({ precio: 149.99 })
      .eq('id', insertedProduct[0].id)
      .select()

    if (updateError) {
      console.error('   ❌ Error al actualizar:', updateError.message)
    } else {
      console.log('   ✅ Producto actualizado exitosamente!')
      console.log('   Nuevo precio:', updatedProduct[0]?.precio)
    }

    // Test 4: Intentar eliminar
    console.log('\n📊 Test 4: Intentando eliminar producto de prueba...')
    const { error: deleteError } = await supabase
      .from('productos')
      .delete()
      .eq('id', insertedProduct[0].id)

    if (deleteError) {
      console.error('   ❌ Error al eliminar:', deleteError.message)
    } else {
      console.log('   ✅ Producto eliminado exitosamente!')
    }
  }

  // Test 5: Verificar estructura de tabla
  console.log('\n📊 Test 5: Verificando estructura de tabla productos...')
  const { data: columns, error: columnsError } = await supabase
    .from('productos')
    .select('*')
    .limit(1)

  if (columnsError) {
    console.error('   ❌ Error:', columnsError.message)
  } else if (columns && columns.length > 0) {
    console.log('   ✅ Columnas disponibles:', Object.keys(columns[0]).join(', '))
  } else {
    console.log('   ⚠️  No hay productos en la tabla')
  }

  console.log('\n🔍 ANÁLISIS DE PROBLEMAS COMUNES:\n')
  
  console.log('1️⃣ Si el error dice "new row violates row-level security policy":')
  console.log('   → Las políticas RLS bloquean inserts desde el cliente')
  console.log('   → Solución: Usar SUPABASE_SERVICE_ROLE_KEY en el frontend (NO RECOMENDADO)')
  console.log('   → Solución CORRECTA: Agregar política RLS que permita a admins insertar')
  console.log('')
  
  console.log('2️⃣ Si el error dice "column does not exist":')
  console.log('   → El código usa nombres de columnas incorrectos')
  console.log('   → Verificar que AdminProducts.tsx use "imagen" y "activo"')
  console.log('')
  
  console.log('3️⃣ Si no hay error pero no se actualiza la UI:')
  console.log('   → Problema con el fetchProductos() después de crear/editar')
  console.log('   → Verificar que se llame fetchProductos() al cerrar modal')
  console.log('')

  console.log('💡 SOLUCIÓN RECOMENDADA:')
  console.log('')
  console.log('Ejecutar en Supabase SQL Editor:')
  console.log('')
  console.log('-- Permitir que admins gestionen productos')
  console.log('CREATE POLICY "Admins pueden gestionar productos" ON productos')
  console.log('  FOR ALL USING (')
  console.log('    EXISTS (')
  console.log('      SELECT 1 FROM usuarios')
  console.log('      WHERE id = auth.uid()::text AND rol = \'admin\'')
  console.log('    )')
  console.log('  );')
  console.log('')

  console.log('✅ Diagnóstico completo\n')
}

testAdminOperations().catch(console.error)
