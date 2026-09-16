import { AgentInput, AgentOutput } from '../types'

export interface IdentityConsistencyResult {
  consistent: boolean
  mismatches: string[]
}

export async function IdentityConsistencyAgent(input: AgentInput): Promise<AgentOutput<IdentityConsistencyResult>> {
  const addr = input.case.address
  const mismatches: string[] = []
  // very simple heuristics: if country not provided in identity assume mismatch when country differs from address
  if (input.case.customerProfile.nationality && input.case.customerProfile.nationality !== addr.country) {
    mismatches.push('nationality_vs_address_country')
  }
  const out = {
    agent: 'IdentityConsistencyAgent',
    ok: mismatches.length === 0,
    data: { consistent: mismatches.length === 0, mismatches },
    explanation: mismatches.length === 0 ? 'Identity appears consistent' : `Mismatches: ${mismatches.join(',')}`
  }
  return out
}
