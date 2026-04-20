'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputStyle = {
  width: '100%',
  background: '#0A0A0A',
  border: '1px solid #1e1e1e',
  borderRadius: 2,
  color: '#ffffff',
  padding: '12px 14px',
  fontSize: 13,
  fontFamily: 'var(--font-mono), monospace',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [splashVisible, setSplashVisible] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 1200)
    const t2 = setTimeout(() => {
      setSplashVisible(false)
      setFormVisible(true)
    }, 1800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passcodes do not match.')
      return
    }
    if (password.length < 8) {
      setError('Passcode must be at least 8 characters.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.session) {
      router.push('/subscribe')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  function onInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = '#A855F7'
    e.currentTarget.style.boxShadow = '0 0 8px rgba(168,85,247,0.3)'
  }
  function onInputBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = '#1e1e1e'
    e.currentTarget.style.boxShadow = 'none'
  }

  if (success) {
    return (
      <div
        style={{
          background: '#0A0A0A',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <img
            src="/vanguard-logo.png"
            alt="Vanguard"
            style={{ height: 200, width: 'auto', display: 'inline-block', marginBottom: 28 }}
          />
          <h2
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono), monospace',
              marginBottom: 12,
            }}
          >
            Confirm Your Identity
          </h2>
          <p style={{ color: '#A9A9A9', fontSize: 13, lineHeight: 1.7 }}>
            A confirmation link has been sent to{' '}
            <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono), monospace' }}>
              {email}
            </span>
            . Click it to activate your account and begin the record.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              marginTop: 28,
              fontSize: 10,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#A855F7',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            Access Terminal →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>

      {/* Splash screen */}
      {splashVisible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            opacity: splashFading ? 0 : 1,
            transition: 'opacity 0.6s ease',
            pointerEvents: splashFading ? 'none' : 'all',
          }}
        >
          <img
            src="/vanguard-logo.png"
            alt="Vanguard"
            style={{
              height: 92,
              width: 'auto',
              animation: 'logoPulse 0.6s ease-out forwards',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes logoPulse {
          0%   { box-shadow: none; opacity: 0.6; }
          50%  { box-shadow: 0 0 30px rgba(168,85,247,0.6); opacity: 1; }
          100% { box-shadow: 0 0 30px rgba(168,85,247,0.2); opacity: 1; }
        }
      `}</style>

      {/* Signup form */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          opacity: formVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div
            style={{
              background: '#111111',
              border: '1px solid #1e1e1e',
              borderRadius: 4,
              padding: 40,
            }}
          >
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <img
                src="/vanguard-logo.png"
                alt="Vanguard"
                style={{ height: 200, width: 'auto', display: 'inline-block' }}
              />
            </div>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono), monospace',
                  marginBottom: 10,
                }}
              >
                Initiate Contract
              </h1>
              <p style={{ color: '#555555', fontSize: 12, letterSpacing: '2px' }}>
                Define the standard. Begin the record.
              </p>
            </div>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#A9A9A9',
                    fontSize: 10,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono), monospace',
                    marginBottom: 8,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="operator@domain.com"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#A9A9A9',
                    fontSize: 10,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono), monospace',
                    marginBottom: 8,
                  }}
                >
                  Passcode
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="Minimum 8 characters"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#A9A9A9',
                    fontSize: 10,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-mono), monospace',
                    marginBottom: 8,
                  }}
                >
                  Confirm Passcode
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div
                  style={{
                    border: '1px solid rgba(127,29,29,0.6)',
                    background: 'rgba(127,29,29,0.1)',
                    color: '#fca5a5',
                    fontSize: 12,
                    padding: '10px 14px',
                    borderRadius: 2,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#A9A9A9',
                  color: '#000000',
                  border: 'none',
                  borderRadius: 2,
                  padding: '13px 0',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? 'Initiating...' : 'Sign The Contract'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 12,
              color: '#555555',
              letterSpacing: '1px',
            }}
          >
            Already enlisted?{' '}
            <Link href="/login" style={{ color: '#A855F7', textDecoration: 'none' }}>
              Access Terminal.
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
