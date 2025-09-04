#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Mercadillo Lima Perú...\n');

// Verificar archivos necesarios
const requiredFiles = [
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
  'src/config/env.ts',
  'supabase-schema.sql',
  'vercel.json'
];

console.log('📁 Verificando archivos del proyecto...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

// Verificar archivo .env.local
console.log('\n🔑 Verificando variables de entorno...');
const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_CLOUDINARY_CLOUD_NAME',
    'VITE_CLOUDINARY_UPLOAD_PRESET'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('✅ Variables de entorno configuradas');
  } else {
    console.log('❌ Variables faltantes:', missingVars.join(', '));
  }
  
  // Verificar Supabase
  if (envContent.includes('tu-proyecto-id.supabase.co')) {
    console.log('⚠️  Supabase necesita configuración');
  } else if (envContent.includes('VITE_SUPABASE_URL') && envContent.includes('VITE_SUPABASE_ANON_KEY')) {
    console.log('✅ Supabase configurado');
  }
  
} else {
  console.log('❌ Archivo .env.local no encontrado');
  console.log('💡 Ejecuta: pnpm configure');
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@clerk/clerk-react',
    '@supabase/supabase-js',
    '@stripe/stripe-js',
    'react',
    'react-dom',
    'react-router-dom'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ Dependencias configuradas');
  } else {
    console.log('❌ Dependencias faltantes:', missingDeps.join(', '));
    console.log('💡 Ejecuta: pnpm install');
  }
}

// Resumen
console.log('\n📋 Resumen de configuración:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (allFilesExist) {
  console.log('✅ Estructura del proyecto: COMPLETA');
} else {
  console.log('❌ Estructura del proyecto: INCOMPLETA');
}

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('tu-proyecto-id.supabase.co')) {
    console.log('⚠️  Supabase: PENDIENTE');
  } else {
    console.log('✅ Variables de entorno: CONFIGURADAS');
  }
} else {
  console.log('❌ Variables de entorno: NO CONFIGURADAS');
}

console.log('\n🚀 Próximos pasos:');
console.log('1. Ejecuta: pnpm configure (si no lo has hecho)');
console.log('2. Configura Supabase siguiendo SUPABASE-SETUP.md');
console.log('3. Ejecuta: pnpm install');
console.log('4. Ejecuta: pnpm dev');
console.log('\n📚 Documentación:');
console.log('- CONFIGURACION.md - Guía completa');
console.log('- SUPABASE-SETUP.md - Configuración de Supabase');
console.log('- README.md - Documentación del proyecto');

console.log('\n🎉 ¡Verificación completada!');
