import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key')
}

export const stripePromise = loadStripe(stripePublishableKey)

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


