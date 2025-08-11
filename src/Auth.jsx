import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Auth({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // After sign up, the user may need to confirm email depending on Supabase settings
        alert('Check your email to confirm your account.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Fetch session to update parent state
        const { data: sessionData } = await supabase.auth.getSession()
        setUser(sessionData?.session?.user ?? null)
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
      // User will be redirected back by Supabase; onAuthStateChange in App will handle state
    } catch (err) {
      setErrorMsg(err?.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '40px auto', padding: 16, border: '1px solid #eee', borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>{isSignUp ? 'Create account' : 'Sign in'}</h2>

      {errorMsg ? (
        <div style={{ background: '#ffe8e8', border: '1px solid #f5a5a5', color: '#b00020', padding: 8, borderRadius: 8, marginBottom: 12 }}>
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={handleAuth}>
        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #ddd' }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, margin: '6px 0 16px', borderRadius: 8, border: '1px solid #ddd' }}
        />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 8 }}>
          {loading ? 'Loading…' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#eee' }} />
        <span style={{ color: '#888', fontSize: 12 }}>or</span>
        <div style={{ flex: 1, height: 1, background: '#eee' }} />
      </div>

      <button type="button" onClick={signInWithGoogle} disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 8 }}>
        Continue with Google
      </button>

      <p style={{ marginTop: 12, fontSize: 14 }}>
        {isSignUp ? 'Already have an account? ' : 'Don’t have an account? '}
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'transparent', border: 0, color: '#2563eb', cursor: 'pointer' }}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}