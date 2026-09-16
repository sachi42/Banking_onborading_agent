export type AutonomyMode = 'human_approval_required' | 'human_review_on_exception'

export interface OnboardingCase {
  id: string
  customerProfile: {
    name: string
    dob?: string
    nationality?: string
  }
  identity: {
    idType: string
    idNumber: string
  }
  address: {
    line1: string
    city: string
    country: string
  }
  employment?: {
    employer?: string
    role?: string
    incomeBracket?: 'low' | 'medium' | 'high'
  }
  supportingDocuments: Array<{ type: string; present: boolean }>
  basicRiskIndicators?: { politicallyExposed?: boolean; negativeNews?: boolean }
}

export interface AgentInput<T = any> {
  case: OnboardingCase
  context?: T
}

export interface AgentOutput<T = any> {
  agent: string
  ok: boolean
  data: T
  explanation?: string
}

export interface OrchestratorResult {
  finalDecision: 'Approve' | 'Reject' | 'Refer' | 'PendingApproval'
  explanation: string
  trace: AgentOutput[]
  requiresApproval?: boolean
}
