'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Leadership',
  'Community Service',
  'Work/Internship',
  'Research/Academic',
  'Extracurricular',
  'Personal Growth',
]

const QUESTIONS = [
  'Give me a quick overview — what was the situation?',
  'What was your specific role or responsibility?',
  'Walk me through what you personally did.',
  'How did it turn out? Any numbers or outcomes?',
]

type STARResult = {
  title: string
  situation: string
  task: string
  action: string
  result: string
  tags: string[]
}

type Message = { role: 'ai' | 'user'; text: string }

export default function NewExperiencePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'category' | 'interview' | 'loading' | 'confirm'>('category')
  const [category, setCategory] = useState('')
  const [answers, setAnswers] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [star, setStar] = useState<STARResult | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (step === 'interview') inputRef.current?.focus()
  }, [step, qIndex])

  function startInterview(cat: string) {
    setCategory(cat)
    setMessages([{ role: 'ai', text: QUESTIONS[0] }])
    setQIndex(0)
    setAnswers([])
    setStep('interview')
  }

  async function submitAnswer() {
    const trimmed = input.trim()
    if (!trimmed) return
    const newAnswers = [...answers, trimmed]
    const newMessages: Message[] = [...messages, { role: 'user', text: trimmed }]
    setInput('')

    if (qIndex < QUESTIONS.length - 1) {
      const next = qIndex + 1
      setAnswers(newAnswers)
      setMessages([...newMessages, { role: 'ai', text: QUESTIONS[next] }])
      setQIndex(next)
    } else {
      setAnswers(newAnswers)
      setMessages(newMessages)
      setStep('loading')
      try {
        const res = await fetch('/api/experiences/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, answers: newAnswers }),
        })
        if (!res.ok) throw new Error('Extraction failed')
        const data: STARResult = await res.json()
        setStar(data)
        setTags(data.tags ?? [])
        setStep('confirm')
      } catch (e) {
        setError('Something went wrong. Please try again.')
        setStep('interview')
        setMessages([...newMessages, { role: 'ai', text: 'Sorry, something went wrong. Let\'s try again — ' + QUESTIONS[qIndex] }])
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitAnswer()
    }
  }

  async function handleSave() {
    if (!star) return
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in.'); setSaving(false); return }
    const { error: saveError } = await supabase.from('experiences').insert({
      user_id: user.id,
      category,
      title: star.title,
      situation: star.situation,
      task: star.task,
      action: star.action,
      result: star.result,
      tags,
    })
    if (saveError) { setError(saveError.message); setSaving(false); return }
    router.push('/experiences')
  }

  // ── Category selection ──────────────────────────────────────────────────────
  if (step === 'category') {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 1rem' }}>
        <a href="/experiences" style={{ fontSize: 13, color: '#7F77DD', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>← Back</a>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Add an experience</h1>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 28 }}>Pick a category to get started.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => startInterview(cat)}
              style={{
                padding: '16px 12px', border: '1.5px solid #e5e5e5', borderRadius: 10,
                background: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                textAlign: 'left', transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7F77DD'; (e.currentTarget as HTMLButtonElement).style.background = '#f5f4ff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e5e5'; (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 1rem', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e5e5', borderTop: '3px solid #7F77DD', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 15, color: '#555' }}>Structuring your experience…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Confirmation / edit ─────────────────────────────────────────────────────
  if (step === 'confirm' && star) {
    const fields: { key: keyof STARResult; label: string }[] = [
      { key: 'situation', label: 'Situation' },
      { key: 'task', label: 'Task' },
      { key: 'action', label: 'Action' },
      { key: 'result', label: 'Result' },
    ]
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 1rem 80px' }}>
        <button onClick={() => setStep('category')} style={{ fontSize: 13, color: '#7F77DD', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 24 }}>← Start over</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 12, background: '#ede9fe', color: '#7F77DD', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{category}</span>
        </div>
        <input
          value={star.title}
          onChange={e => setStar({ ...star, title: e.target.value })}
          style={{ width: '100%', fontSize: 20, fontWeight: 600, border: 'none', outline: 'none', marginBottom: 20, padding: 0, boxSizing: 'border-box' as const }}
          placeholder="Experience title"
        />
        {fields.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 4 }}>{label}</div>
            <textarea
              value={star[key] as string}
              onChange={e => setStar({ ...star, [key]: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' as const, fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 8 }}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {star.tags.map(tag => (
              <button
                key={tag}
                onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1.5px solid',
                  borderColor: tags.includes(tag) ? '#7F77DD' : '#e5e5e5',
                  background: tags.includes(tag) ? '#ede9fe' : '#fff',
                  color: tags.includes(tag) ? '#7F77DD' : '#555',
                  fontWeight: tags.includes(tag) ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#d32f2f', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: '11px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : 'Save experience'}
        </button>
      </div>
    )
  }

  // ── Interview ───────────────────────────────────────────────────────────────
  const answeredCount = answers.length
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '20px 0 12px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <button onClick={() => setStep('category')} style={{ fontSize: 13, color: '#7F77DD', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>← Change category</button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#444' }}>{category}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {QUESTIONS.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= answeredCount ? '#7F77DD' : '#e5e5e5', transition: 'background 0.2s' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#7F77DD' : '#f5f5f5',
              color: msg.role === 'user' ? '#fff' : '#222',
              fontSize: 14, lineHeight: 1.5,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 0 24px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
        {error && <p style={{ color: '#d32f2f', fontSize: 13, marginBottom: 8 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type your answer… (Enter to send)"
            style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e5e5', borderRadius: 10, fontSize: 14, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#7F77DD' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e5e5' }}
          />
          <button
            onClick={submitAnswer}
            disabled={!input.trim()}
            style={{ padding: '10px 18px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: input.trim() ? 'pointer' : 'not-allowed', opacity: input.trim() ? 1 : 0.5, flexShrink: 0 }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
