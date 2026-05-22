'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, name })
    }
    router.push('/profile/setup')
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Create your Applyr account</h1>
      <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 12px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', marginBottom: 10, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px 12px', marginBottom: 16, border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
      {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <button onClick={handleSignup} disabled={loading} style={{ width: '100%', padding: '11px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
        {loading ? 'Creating account...' : 'Sign up'}
      </button>
      <p style={{ fontSize: 13, marginTop: 16, textAlign: 'center' }}>Already have an account? <a href="/auth/login" style={{ color: '#7F77DD' }}>Log in</a></p>
    </div>
  )
}