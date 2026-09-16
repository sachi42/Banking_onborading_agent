import { AgentInput, AgentOutput } from '../types'

export interface RiskIndicatorResult {
  score: number
  flags: string[]
}

export async function RiskIndicatorAgent(input: AgentInput): Promise<AgentOutput<RiskIndicatorResult>> {
  const indicators = input.case.basicRiskIndicators || {}
  let score = 0
  const flags: string[] = []
  if (indicators.politicallyExposed) { score += 40; flags.push('PEP') }
  if (indicators.negativeNews) { score += 50; flags.push('NegativeNews') }
  const income = input.case.employment?.incomeBracket
  if (income === 'low') { score += 10 }
  if (income === 'high') { score -= 10 }
  const out = {
    agent: 'RiskIndicatorAgent',
    ok: true,
    data: { score, flags },
    explanation: `Risk score: ${score}`
  }
  return out
}
