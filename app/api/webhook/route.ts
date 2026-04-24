// Re-export the Stripe webhook handler — registered at /api/webhook
// (Stripe dashboard can be pointed to either /api/webhook or /api/stripe/webhook)
export { POST } from '@/app/api/stripe/webhook/route'
