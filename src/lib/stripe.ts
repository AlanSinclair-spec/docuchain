import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Server-side Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  foundation: {
    name: 'Foundation',
    price: 79,
    priceId: process.env.STRIPE_PRICE_FOUNDATION!,
    features: [
      'Up to 20 vendors',
      'Basic document management',
      'Email notifications',
      'Standard support',
      '200 documents'
    ]
  },
  professional: {
    name: 'Professional',
    price: 249,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL!,
    features: [
      'Unlimited vendors',
      'Advanced compliance tracking',
      'API access',
      'Priority support',
      'Custom workflows',
      'Unlimited documents'
    ]
  }
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS
