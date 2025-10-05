import { VercelRequest, VercelResponse } from '@vercel/node'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificar la firma del webhook de Clerk
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET')
    return res.status(500).json({ error: 'Missing webhook secret' })
  }

  // Obtener los headers de Svix
  const svix_id = req.headers['svix-id'] as string
  const svix_timestamp = req.headers['svix-timestamp'] as string
  const svix_signature = req.headers['svix-signature'] as string

  // Si faltan headers, retornar error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' })
  }

  // Crear una instancia de Svix webhook
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verificar el payload con los headers
  try {
    evt = wh.verify(JSON.stringify(req.body), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('❌ Error verifying webhook:', err)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // Obtener el tipo de evento
  const eventType = evt.type

  console.log('📥 Clerk webhook received:', eventType)

  try {
    switch (eventType) {
      case 'user.created':
        // Usuario creado (esto ya lo maneja AuthSync, pero por si acaso)
        const createdUser = evt.data
        console.log('👤 User created:', createdUser.id)
        
        await supabase.from('usuarios').insert({
          id: createdUser.id,
          email: createdUser.email_addresses[0]?.email_address || '',
          nombre: createdUser.first_name || 'Usuario',
          apellido: createdUser.last_name || '',
          telefono: createdUser.phone_numbers[0]?.phone_number || null,
          rol: 'cliente',
        })
        
        console.log('✅ User profile created in Supabase')
        break

      case 'user.updated':
        // Usuario actualizado - AQUÍ ES LO IMPORTANTE
        const updatedUser = evt.data
        console.log('📝 User updated:', updatedUser.id)
        
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({
            email: updatedUser.email_addresses[0]?.email_address || '',
            nombre: updatedUser.first_name || '',
            apellido: updatedUser.last_name || '',
            telefono: updatedUser.phone_numbers[0]?.phone_number || null,
          })
          .eq('id', updatedUser.id)

        if (updateError) {
          console.error('❌ Error updating user in Supabase:', updateError)
          return res.status(500).json({ error: updateError.message })
        }

        console.log('✅ User profile updated in Supabase')
        break

      case 'user.deleted':
        // Usuario eliminado
        const deletedUser = evt.data
        console.log('🗑️ User deleted:', deletedUser.id)
        
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', deletedUser.id)
        
        console.log('✅ User profile deleted from Supabase')
        break

      default:
        console.log('ℹ️ Unhandled event type:', eventType)
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error)
    return res.status(500).json({ error: error?.message || 'Internal server error' })
  }
}
