import { OnboardingCase, AgentInput, AgentOutput, OrchestratorResult, AutonomyMode } from './types'
import * as docAgent from './agents/documentCompletenessAgent'
import * as idAgent from './agents/identityConsistencyAgent'
import * as riskAgent from './agents/riskIndicatorAgent'
import * as recAgent from './agents/recommendationAgent'

export async function runReview(casePayload: OnboardingCase, mode: AutonomyMode = 'human_review_on_exception', llmKey?: string): Promise<OrchestratorResult> {
  const trace: AgentOutput[] = []
  const ctx: AgentInput = { case: casePayload, context: { llmKey } }

  // Document completeness
  try {
    const doc = await docAgent.DocumentCompletenessAgent(ctx)
    trace.push(doc)
  } catch (e) {
    trace.push({ agent: 'DocumentCompletenessAgent', ok: false, data: null as any, explanation: 'failed' })
    if (mode === 'human_review_on_exception') return { finalDecision: 'Refer', explanation: 'Agent failure', trace }
  }

  // Identity consistency
  try {
    const id = await idAgent.IdentityConsistencyAgent(ctx)
    trace.push(id)
  } catch (e) {
    trace.push({ agent: 'IdentityConsistencyAgent', ok: false, data: null as any, explanation: 'failed' })
    if (mode === 'human_review_on_exception') return { finalDecision: 'Refer', explanation: 'Agent failure', trace }
  }

  // Risk indicators
  try {
    const risk = await riskAgent.RiskIndicatorAgent(ctx)
    trace.push(risk)
  } catch (e) {
    trace.push({ agent: 'RiskIndicatorAgent', ok: false, data: null as any, explanation: 'failed' })
    if (mode === 'human_review_on_exception') return { finalDecision: 'Refer', explanation: 'Agent failure', trace }
  }

  // Recommendation
  try {
    const rec = await recAgent.RecommendationAgent(trace)
    trace.push(rec)

    let finalDecision = rec.data.decision as OrchestratorResult['finalDecision']
    let explanation: string = rec.explanation || ''
    let requiresApproval = false

    if (mode === 'human_approval_required') {
      requiresApproval = true
      finalDecision = 'PendingApproval'
      explanation = 'Awaiting human approval'
    }

    return { finalDecision, explanation, trace, requiresApproval }
  } catch (e) {
    trace.push({ agent: 'RecommendationAgent', ok: false, data: null as any, explanation: 'failed' })
    return { finalDecision: 'Refer', explanation: 'Recommendation failed', trace }
  }
}
