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

async function testSearch() {
  console.log('\n🔍 TEST DE BÚSQUEDA DE PRODUCTOS\n')
  
  // Test 1: Ver todos los productos
  console.log('📊 Test 1: Productos disponibles en la tabla')
  const { data: allProducts, error: allError } = await supabase
    .from('productos')
    .select('id, nombre, precio, imagen, descripcion, stock, activo')
    .limit(10)
  
  if (allError) {
    console.error('❌ Error:', allError)
  } else {
    console.log(`✅ Total productos encontrados: ${allProducts?.length || 0}`)
    if (allProducts && allProducts.length > 0) {
      allProducts.forEach(p => {
        console.log(`   - ${p.nombre} (activo: ${p.activo}, stock: ${p.stock})`)
      })
    }
  }

  // Test 2: Búsqueda exacta "Laptop HP Pavilion 15"
  console.log('\n📊 Test 2: Búsqueda exacta "Laptop HP Pavilion 15"')
  const { data: exact, error: exactError } = await supabase
    .from('productos')
    .select('id, nombre, precio, imagen, descripcion, stock')
    .or(`nombre.ilike.%Laptop HP Pavilion 15%,descripcion.ilike.%Laptop HP Pavilion 15%`)
    .eq('activo', true)
    .gt('stock', 0)
    .limit(5)
  
  if (exactError) {
    console.error('❌ Error:', exactError)
  } else {
    console.log(`✅ Resultados: ${exact?.length || 0}`)
    if (exact && exact.length > 0) {
      exact.forEach(p => {
        console.log(`   ✓ ${p.nombre} - S/ ${p.precio}`)
      })
    }
  }

  // Test 3: Búsqueda simplificada "laptop"
  console.log('\n📊 Test 3: Búsqueda simplificada "laptop"')
  const { data: simple, error: simpleError } = await supabase
    .from('productos')
    .select('id, nombre, precio, imagen, descripcion, stock')
    .or(`nombre.ilike.%laptop%,descripcion.ilike.%laptop%`)
    .eq('activo', true)
    .gt('stock', 0)
    .limit(5)
  
  if (simpleError) {
    console.error('❌ Error:', simpleError)
  } else {
    console.log(`✅ Resultados: ${simple?.length || 0}`)
    if (simple && simple.length > 0) {
      simple.forEach(p => {
        console.log(`   ✓ ${p.nombre} - S/ ${p.precio}`)
      })
    }
  }

  // Test 4: Búsqueda "hp"
  console.log('\n📊 Test 4: Búsqueda "hp"')
  const { data: hp, error: hpError } = await supabase
    .from('productos')
    .select('id, nombre, precio, imagen, descripcion, stock')
    .or(`nombre.ilike.%hp%,descripcion.ilike.%hp%`)
    .eq('activo', true)
    .gt('stock', 0)
    .limit(5)
  
  if (hpError) {
    console.error('❌ Error:', hpError)
  } else {
    console.log(`✅ Resultados: ${hp?.length || 0}`)
    if (hp && hp.length > 0) {
      hp.forEach(p => {
        console.log(`   ✓ ${p.nombre} - S/ ${p.precio}`)
      })
    }
  }

  // Test 5: Simular detección de búsqueda del chatbot
  console.log('\n📊 Test 5: Simulación de chatbot con mensaje "Laptop HP Pavilion 15"')
  const userMessage = 'Laptop HP Pavilion 15'
  const searchKeywords = ['busca', 'buscar', 'muestra', 'muéstrame', 'quiero ver', 'productos de', 'tienes', 'venden', 'hay']
  const isProductSearch = searchKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))
  
  console.log(`   Mensaje: "${userMessage}"`)
  console.log(`   ¿Detectado como búsqueda?: ${isProductSearch ? '✅ SÍ' : '❌ NO'}`)
  
  if (!isProductSearch) {
    console.log('\n⚠️  PROBLEMA ENCONTRADO:')
    console.log('   El mensaje "Laptop HP Pavilion 15" NO contiene palabras clave de búsqueda')
    console.log('   El usuario debe escribir: "busca Laptop HP Pavilion 15" o "muéstrame Laptop HP Pavilion 15"')
  }

  console.log('\n✅ Tests completados\n')
}

testSearch().catch(console.error)
