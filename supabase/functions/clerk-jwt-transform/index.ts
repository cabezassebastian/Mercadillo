import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ClerkJWT {
  sub: string
  iat: number
  exp: number
  iss: string
  aud: string
  email?: string
  session_id?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const jwt = authHeader.replace('Bearer ', '')
    
    // Decode JWT without verification (Clerk will verify it)
    const payload = JSON.parse(
      atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as ClerkJWT

    // Transform Clerk JWT to Supabase-compatible format
    const supabaseJWT = {
      aud: 'authenticated',
      exp: payload.exp,
      iat: payload.iat,
      iss: `${Deno.env.get('SUPABASE_URL')}/auth/v1`,
      sub: payload.sub, // Clerk user ID should be UUID format
      email: payload.email,
      role: 'authenticated',
      aal: 'aal1',
      amr: ['password'],
      session_id: payload.session_id || payload.sub,
      user_metadata: {
        email: payload.email,
        email_verified: true,
        phone_verified: false,
        sub: payload.sub
      },
      app_metadata: {
        provider: 'clerk',
        providers: ['clerk']
      }
    }

    return new Response(
      JSON.stringify({ jwt: supabaseJWT }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('JWT transform error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  }
})
