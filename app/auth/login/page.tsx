'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Log in to Applyr</h1>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', marginBottom: 16, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
      {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '11px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
      <p style={{ fontSize: 13, marginTop: 16, textAlign: 'center' }}>Don't have an account? <a href="/auth/signup" style={{ color: '#7F77DD' }}>Sign up</a></p>
    </div>
  )
}