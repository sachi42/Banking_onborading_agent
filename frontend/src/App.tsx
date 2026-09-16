import React, { useEffect, useState } from 'react'

type Mode = 'human_approval_required' | 'human_review_on_exception'

export default function App() {
  const [cases, setCases] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('human_review_on_exception')
  const [result, setResult] = useState<any>(null)

  useEffect(() => { fetch('/cases').then(r => r.json()).then(setCases).catch(()=>{}) }, [])

  async function runReview() {
    if (!selected) return
    const res = await fetch(`/cases/${selected}/review`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ mode }) })
    const json = await res.json()
    setResult(json)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Multi-Agent Onboarding Case Reviewer</h2>
      <div>
        <label>Case: </label>
        <select value={selected ?? ''} onChange={e=>setSelected(e.target.value || null)}>
          <option value="">-- select --</option>
          {cases.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Autonomy mode: </label>
        <select value={mode} onChange={e=>setMode(e.target.value as Mode)}>
          <option value="human_approval_required">Human approval required</option>
          <option value="human_review_on_exception">Human review on exception</option>
        </select>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={runReview} disabled={!selected}>Run Review</button>
      </div>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
