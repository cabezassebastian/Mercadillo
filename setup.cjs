#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Mercadillo Lima Perú...\n');

// Crear archivo .env.local si no existe
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.local.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env.local creado desde env.local.example');
  } else {
    console.log('❌ No se encontró env.local.example');
  }
} else {
  console.log('✅ Archivo .env.local ya existe');
}

console.log('\n📋 Próximos pasos:');
console.log('1. Configura las variables de entorno en .env.local');
console.log('2. Ejecuta: pnpm install');
console.log('3. Ejecuta: pnpm dev');
console.log('\n🔑 Servicios a configurar:');
console.log('- Clerk: https://clerk.com');
console.log('- Supabase: https://supabase.com');
console.log('- Stripe: https://stripe.com');
console.log('- Cloudinary: https://cloudinary.com');
console.log('\n📚 Documentación completa en README.md');
