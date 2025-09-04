// Configuración de variables de entorno con validación
export const env = {
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  MERCADOPAGO_PUBLIC_KEY: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
} as const

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'CLERK_PUBLISHABLE_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_UPLOAD_PRESET',
] as const

for (const envVar of requiredEnvVars) {
  if (!env[envVar]) {
    throw new Error(`Missing required environment variable: VITE_${envVar}`)
  }
}

export default env
