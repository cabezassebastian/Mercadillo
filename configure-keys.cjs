#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔑 Configurando keys de Mercadillo Lima Perú...\n');

// Keys proporcionadas por el usuario
const keys = {
  CLERK_PUBLISHABLE_KEY: 'pk_test_a25vd24tZG9iZXJtYW4tMTEuY2xlcmsuYWNjb3VudHMuZGV2JA',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51S3L8sDJ2Uq8pGw9YlYU8y4vtUmTkDuJlQyKvuGqwcC7ekZx3uKVILjGhPAsM76XwOhOfc1l22pX9xxaqpqYkA02007UYskdYH',
  STRIPE_SECRET_KEY: 'sk_test_51S3L8sDJ2Uq8pGw90Ty7TqgjguPBGWjcnipSbjHzPd3RrDcymXugnpk1EhY95KLAH8pBTkf9ud7QPYgl9ts7aKrr00Ej5ygSv0',
  CLOUDINARY_CLOUD_NAME: 'ddbjhpjri',
  CLOUDINARY_UPLOAD_PRESET: 'mercadillo_upload'
};

// Contenido del archivo .env.local
const envContent = `# Mercadillo Lima Perú - Variables de Entorno
# Keys configuradas automáticamente

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=${keys.CLERK_PUBLISHABLE_KEY}

# Supabase Database (PENDIENTE - Necesitas crear proyecto en Supabase)
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui

# Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=${keys.STRIPE_PUBLISHABLE_KEY}

# Cloudinary Images
VITE_CLOUDINARY_CLOUD_NAME=${keys.CLOUDINARY_CLOUD_NAME}
VITE_CLOUDINARY_UPLOAD_PRESET=${keys.CLOUDINARY_UPLOAD_PRESET}

# Mercado Pago (Opcional para Perú)
VITE_MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key_aqui

# Variables para Vercel (solo para producción)
STRIPE_SECRET_KEY=${keys.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_aqui
`;

// Crear archivo .env.local
const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado con tus keys');
  console.log('✅ Clerk configurado');
  console.log('✅ Stripe configurado');
  console.log('✅ Cloudinary configurado');
  console.log('\n⚠️  PENDIENTE: Configurar Supabase');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Crear proyecto en Supabase: https://supabase.com');
  console.log('2. Ejecutar el script supabase-schema.sql');
  console.log('3. Copiar la URL y ANON_KEY a .env.local');
  console.log('4. Ejecutar: pnpm install');
  console.log('5. Ejecutar: pnpm dev');
  console.log('\n🎉 ¡Tu e-commerce está casi listo!');
} catch (error) {
  console.error('❌ Error creando .env.local:', error.message);
  console.log('\n📝 Crea manualmente el archivo .env.local con este contenido:');
  console.log(envContent);
}
