import { loadStripe } from '@stripe/stripe-js'
import { env } from '@/config/env'

export const stripePromise = loadStripe(env.STRIPE_PUBLISHABLE_KEY)

export interface CheckoutSession {
  id: string
  url: string
}

export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
}


