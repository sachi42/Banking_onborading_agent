import { AgentInput, AgentOutput } from '../types'

export interface RecommendationResult {
  decision: 'Approve' | 'Reject' | 'Refer' | 'PendingApproval'
  reasons: string[]
}

export async function RecommendationAgent(inputs: AgentOutput[]): Promise<AgentOutput<RecommendationResult>> {
  const doc = inputs.find(i => i.agent === 'DocumentCompletenessAgent')
  const id = inputs.find(i => i.agent === 'IdentityConsistencyAgent')
  const risk = inputs.find(i => i.agent === 'RiskIndicatorAgent')

  const reasons: string[] = []
  let decision: RecommendationResult['decision'] = 'Approve'

  if (doc && !doc.ok) {
    reasons.push('Missing documents')
    decision = 'Refer'
  }
  if (id && !id.ok) {
    reasons.push('Identity inconsistency')
    decision = 'Refer'
  }
  const riskScore = (risk && (risk.data as any).score) ?? 0
  if (riskScore >= 80) {
    reasons.push('High risk score')
    decision = 'Reject'
  } else if (riskScore >= 40) {
    reasons.push('Elevated risk')
    decision = 'Refer'
  }

  const out = {
    agent: 'RecommendationAgent',
    ok: true,
    data: { decision, reasons },
    explanation: `Decision ${decision}; ${reasons.join('; ')}`
  }
  return out
}
