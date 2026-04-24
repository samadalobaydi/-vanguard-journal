'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ─── Inner form (needs Stripe context) ──────────────────────────────────────

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()

  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setStatus('processing')
    setErrorMsg(null)

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
      redirect: 'if_required',
    })

    if (result.error) {
      setErrorMsg(result.error.message ?? 'Payment failed. Please try again.')
      setStatus('error')
      return
    }

    // Payment confirmed — update subscription_status optimistically in case webhook is slow
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', user.id)
      }
    } catch {
      // Non-fatal — webhook will catch it
    }

    window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Stripe Payment Element — handles card, Apple Pay, Google Pay */}
      <div style={{ marginBottom: 24 }}>
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: { billingDetails: { email: 'never' } },
            defaultValues: {},
            wallets: { applePay: 'auto', googlePay: 'auto' },
            terms: { card: 'never' },
          }}
        />
      </div>

      {errorMsg && (
        <div style={{
          border: '1px solid rgba(127,29,29,0.6)',
          background: 'rgba(127,29,29,0.1)',
          color: '#fca5a5',
          fontSize: 11,
          letterSpacing: '1px',
          padding: '10px 14px',
          marginBottom: 16,
          fontFamily: 'inherit',
        }}>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || status === 'processing'}
        className="confirm-btn"
      >
        {status === 'processing' ? '[ PROCESSING... ]' : '[ CONFIRM ACTIVATION ]'}
      </button>
    </form>
  )
}

// ─── Loader — fetches client secret then mounts Elements ────────────────────

function PaymentLoader() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/create-payment-intent', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setFetchError(data.error ?? 'Failed to initialise payment.')
        }
      })
      .catch(() => setFetchError('Network error. Please refresh.'))
  }, [])

  if (fetchError) {
    return (
      <div style={{
        border: '1px solid rgba(127,29,29,0.6)',
        background: 'rgba(127,29,29,0.1)',
        color: '#fca5a5',
        fontSize: 11,
        letterSpacing: '1px',
        padding: '12px 16px',
        fontFamily: 'inherit',
      }}>
        {fetchError}
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div style={{ color: '#555555', fontSize: 11, letterSpacing: '3px', textAlign: 'center', padding: '32px 0' }}>
        INITIALISING SECURE CONNECTION...
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        locale: 'en-GB',
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#A855F7',
            colorBackground: '#0a0a0a',
            colorText: '#ffffff',
            colorTextSecondary: '#A9A9A9',
            colorDanger: '#fca5a5',
            fontFamily: "'JetBrains Mono', monospace",
            borderRadius: '0px',
            colorIcon: '#A9A9A9',
          },
          rules: {
            '.Input': {
              border: '1px solid #1e1e1e',
              backgroundColor: '#000000',
              color: '#ffffff',
              outline: 'none',
            },
            '.Input:focus': {
              border: '1px solid #A855F7',
              boxShadow: '0 0 12px rgba(168,85,247,0.25)',
            },
            '.Label': {
              color: '#555555',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '10px',
            },
            '.Tab': {
              border: '1px solid #1e1e1e',
              backgroundColor: '#000000',
              color: '#A9A9A9',
            },
            '.Tab--selected': {
              border: '1px solid #A855F7',
              color: '#ffffff',
            },
            '.Tab:hover': {
              color: '#ffffff',
            },
          },
        },
      }}
    >
      <PaymentForm />
    </Elements>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  return (
    <div
      style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: "'JetBrains Mono', var(--font-mono), monospace",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        .confirm-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #A855F7;
          color: #A855F7;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 16px 24px;
          cursor: pointer;
          transition: box-shadow 0.3s, background 0.3s;
        }

        .confirm-btn:hover:not(:disabled) {
          background: rgba(168,85,247,0.08);
          box-shadow: 0 0 24px rgba(168,85,247,0.4), inset 0 0 24px rgba(168,85,247,0.06);
        }

        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img
            src="/vanguard-logo.png.png"
            alt="Vanguard"
            style={{ height: 80, width: 'auto', display: 'inline-block', mixBlendMode: 'screen' }}
          />
        </div>

        {/* Title */}
        <p style={{
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '5px',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '0 0 8px',
        }}>
          ACTIVATE FULL TERMINAL
        </p>

        {/* Subtitle */}
        <p style={{
          color: '#555555',
          fontSize: 10,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: '0 0 40px',
        }}>
          £9.99 / MONTH · CANCEL ANYTIME
        </p>

        {/* Payment card */}
        <div style={{
          border: '1px solid #1e1e1e',
          background: 'rgba(255,255,255,0.02)',
          padding: '32px 28px',
        }}>
          <p style={{
            color: '#555555',
            fontSize: 10,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: '0 0 24px',
          }}>
            [ Secure Payment ]
          </p>

          <PaymentLoader />
        </div>

        {/* Legal */}
        <p style={{
          color: '#333333',
          fontSize: 10,
          letterSpacing: '1px',
          textAlign: 'center',
          margin: '20px 0 0',
          lineHeight: 1.7,
        }}>
          Encrypted by Stripe. We never store your card details.
        </p>

      </div>
    </div>
  )
}
