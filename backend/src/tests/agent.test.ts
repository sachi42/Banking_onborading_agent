import { runReview } from '../orchestrator'
import { OnboardingCase } from '../types'

async function main() {
  const sample: OnboardingCase = {
    id: 'tcase-1',
    customerProfile: { name: 'Test', nationality: 'Freedonia' },
    identity: { idType: 'passport', idNumber: 'T123' },
    address: { line1: 'X', city: 'Y', country: 'Freedonia' },
    employment: { employer: 'E', role: 'R', incomeBracket: 'low' },
    supportingDocuments: [{ type: 'id_document', present: true }, { type: 'proof_of_address', present: true }],
    basicRiskIndicators: { politicallyExposed: false, negativeNews: false }
  }

  const result = await runReview(sample, 'human_review_on_exception')
  if (result.finalDecision !== 'Approve') {
    console.error('Expected Approve, got', result.finalDecision)
    process.exit(2)
  }
  console.log('Test passed')
}

main().catch(e => { console.error(e); process.exit(1) })
