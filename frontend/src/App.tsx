import React, { useEffect, useState } from 'react'

type Mode = 'human_approval_required' | 'human_review_on_exception'

export default function App() {
  const [cases, setCases] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('human_review_on_exception')
  const [result, setResult] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [formState, setFormState] = useState({
    id: '', name: '', nationality: '', idType: 'passport', idNumber: '',
    line1: '', city: '', country: '', employer: '', role: '', incomeBracket: 'medium',
    id_document: true, proof_of_address: false, employment_letter: false,
    politicallyExposed: false, negativeNews: false
  })

  useEffect(() => { fetch('/cases').then(r => r.json()).then(setCases).catch(()=>{}) }, [])

  function refreshCases() {
    fetch('/cases').then(r => r.json()).then(setCases).catch(()=>{})
  }

  async function createCaseFromForm() {
    const payload = {
      id: formState.id || `case-${Date.now()}`,
      customerProfile: { name: formState.name, nationality: formState.nationality },
      identity: { idType: formState.idType, idNumber: formState.idNumber },
      address: { line1: formState.line1, city: formState.city, country: formState.country },
      employment: { employer: formState.employer, role: formState.role, incomeBracket: formState.incomeBracket },
      supportingDocuments: [
        { type: 'id_document', present: !!formState.id_document },
        { type: 'proof_of_address', present: !!formState.proof_of_address },
        { type: 'employment_letter', present: !!formState.employment_letter }
      ],
      basicRiskIndicators: { politicallyExposed: !!formState.politicallyExposed, negativeNews: !!formState.negativeNews }
    }
    await fetch('/cases', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    refreshCases()
    setShowCreate(false)
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    const parsed = JSON.parse(text)
    await fetch('/cases', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(parsed) })
    refreshCases()
    setShowCreate(false)
  }

  async function runReview() {
    if (!selected) return
    const res = await fetch(`/cases/${selected}/review`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ mode }) })
    const json = await res.json()
    setResult(json)
    // fetch reviews history
    fetch(`/cases/${selected}/reviews`).then(r=>r.json()).then(setReviews).catch(()=>setReviews([]))
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
        <button style={{ marginLeft: 8 }} onClick={()=>setShowCreate(s => !s)}>Create / Upload Case</button>
      </div>

      {showCreate && (
        <div style={{ marginTop: 12, border: '1px solid #ddd', padding: 10 }}>
          <h4>Create Case</h4>
          <div>
            <label>ID: </label>
            <input value={formState.id} onChange={e=>setFormState(s=>({ ...s, id: e.target.value }))} />
          </div>
          <div>
            <label>Name: </label>
            <input value={formState.name} onChange={e=>setFormState(s=>({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label>Nationality: </label>
            <input value={formState.nationality} onChange={e=>setFormState(s=>({ ...s, nationality: e.target.value }))} />
          </div>
          <div>
            <label>Address country: </label>
            <input value={formState.country} onChange={e=>setFormState(s=>({ ...s, country: e.target.value }))} />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Documents:</label>
            <div>
              <label style={{ marginRight: 8 }}>
                <input type="checkbox" checked={!!formState.id_document} onChange={e=>setFormState(s=>({ ...s, id_document: e.target.checked }))} /> ID Document
              </label>
              <label style={{ marginRight: 8 }}>
                <input type="checkbox" checked={!!formState.proof_of_address} onChange={e=>setFormState(s=>({ ...s, proof_of_address: e.target.checked }))} /> Proof of Address
              </label>
              <label>
                <input type="checkbox" checked={!!formState.employment_letter} onChange={e=>setFormState(s=>({ ...s, employment_letter: e.target.checked }))} /> Employment Letter
              </label>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button onClick={createCaseFromForm}>Create</button>
            <label style={{ marginLeft: 12 }}>Or upload JSON file: <input type="file" accept="application/json" onChange={uploadFile} /></label>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Result</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      {result && result.requiresApproval && selected && (
        <div style={{ marginTop: 12 }}>
          <h4>Human Approval Required</h4>
          <button onClick={async ()=>{
            await fetch(`/cases/${selected}/approve`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ decision: 'Approve', reviewer: 'operator' }) })
            const res = await fetch(`/cases/${selected}/reviews`)
            setReviews(await res.json())
            alert('Approved')
          }}>Approve</button>
          <button style={{ marginLeft: 8 }} onClick={async ()=>{
            const reason = prompt('Reason for rejection') || ''
            await fetch(`/cases/${selected}/approve`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ decision: 'Reject', reviewer: 'operator', comment: reason }) })
            const res = await fetch(`/cases/${selected}/reviews`)
            setReviews(await res.json())
            alert('Rejected')
          }}>Reject</button>
        </div>
      )}

      {reviews.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h4>Approval History</h4>
          <ul>
            {reviews.map((r:any)=> (
              <li key={r.id}>{r.timestamp} — {r.reviewer ?? 'operator'} — {r.decision} {r.comment ? `: ${r.comment}` : ''}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// add reviews state
