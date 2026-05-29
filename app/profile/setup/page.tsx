'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [gpa, setGpa] = useState('')
  const [year, setYear] = useState('')
  const [state, setState] = useState('')
  const [firstGen, setFirstGen] = useState(false)
  const [financialNeed, setFinancialNeed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const GPA_MAP: Record<string, number> = {
    '<2.0': 1.9,
    '2.0-2.5': 2.25,
    '2.5-3.0': 2.75,
    '3.0-3.5': 3.25,
    '3.5-4.0': 3.75,
  }

  async function handleSubmit() {
    setError('')
    if (!school || !major || !gpa || !year || !state) {
      setError('Please fill out all fields.')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in.'); setLoading(false); return }
    const { error: saveError } = await supabase.from('profiles').upsert({
      id: user.id,
      school,
      major,
      gpa: GPA_MAP[gpa],
      year: parseInt(year),
      state,
      first_gen: firstGen,
      financial_need: financialNeed,
      updated_at: new Date().toISOString(),
    })
    if (saveError) { setError(saveError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }
  const selectStyle = { ...inputStyle, background: '#fff', appearance: 'auto' as const }
  const labelStyle = { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: '#444' }

  function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8 }}>
        <span style={{ fontSize: 14 }}>{label}</span>
        <button
          type="button"
          onClick={() => onChange(!value)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: value ? '#7F77DD' : '#ccc', position: 'relative', transition: 'background 0.2s'
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: value ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s'
          }} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Set up your profile</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 28 }}>This helps us match you with the right scholarships.</p>

      <label style={labelStyle}>School</label>
      <input placeholder="e.g. Purdue University" value={school} onChange={e => setSchool(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>Major</label>
      <input placeholder="e.g. Computer Science" value={major} onChange={e => setMajor(e.target.value)} style={inputStyle} />

      <label style={labelStyle}>GPA</label>
      <select value={gpa} onChange={e => setGpa(e.target.value)} style={selectStyle}>
        <option value="">Select GPA range</option>
        <option value="<2.0">Below 2.0</option>
        <option value="2.0-2.5">2.0 – 2.5</option>
        <option value="2.5-3.0">2.5 – 3.0</option>
        <option value="3.0-3.5">3.0 – 3.5</option>
        <option value="3.5-4.0">3.5 – 4.0</option>
      </select>

      <label style={labelStyle}>Year</label>
      <select value={year} onChange={e => setYear(e.target.value)} style={selectStyle}>
        <option value="">Select year</option>
        <option value="1">Freshman (1st year)</option>
        <option value="2">Sophomore (2nd year)</option>
        <option value="3">Junior (3rd year)</option>
        <option value="4">Senior (4th year)</option>
      </select>

      <label style={labelStyle}>State</label>
      <select value={state} onChange={e => setState(e.target.value)} style={selectStyle}>
        <option value="">Select state</option>
        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <Toggle label="First-generation college student" value={firstGen} onChange={setFirstGen} />
      <Toggle label="Financial need" value={financialNeed} onChange={setFinancialNeed} />

      {error && <p style={{ color: '#d32f2f', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width: '100%', padding: '11px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}
