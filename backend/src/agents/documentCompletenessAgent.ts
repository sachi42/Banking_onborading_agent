import { AgentInput, AgentOutput } from '../types'

export interface DocumentCompletenessResult {
  missing: string[]
  presentCount: number
}

export async function DocumentCompletenessAgent(input: AgentInput): Promise<AgentOutput<DocumentCompletenessResult>> {
  const required = ['id_document', 'proof_of_address']
  const present = input.case.supportingDocuments.filter(d => d.present).map(d => d.type)
  const missing = required.filter(r => !present.includes(r))
  const out = {
    agent: 'DocumentCompletenessAgent',
    ok: missing.length === 0,
    data: { missing, presentCount: present.length },
    explanation: missing.length === 0 ? 'All required documents present' : `Missing: ${missing.join(', ')}`
  }
  return out
}
