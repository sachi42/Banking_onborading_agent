import db from './db'
import fs from 'fs'
import path from 'path'
import { OnboardingCase } from './types'

const sample: OnboardingCase = {
  id: 'case-1',
  customerProfile: { name: 'Alice Example', dob: '1990-01-01', nationality: 'Freedonia' },
  identity: { idType: 'passport', idNumber: 'X1234567' },
  address: { line1: '1 Main St', city: 'Capital', country: 'Freedonia' },
  employment: { employer: 'Acme Corp', role: 'Engineer', incomeBracket: 'medium' },
  supportingDocuments: [
    { type: 'id_document', present: true },
    { type: 'proof_of_address', present: false },
    { type: 'employment_letter', present: true }
  ],
  basicRiskIndicators: { politicallyExposed: false, negativeNews: false }
}

const outPath = path.join(__dirname, '..', 'data', 'sample_case.json')
const payloadStr = JSON.stringify(sample, null, 2)

const insert = db.prepare('INSERT OR REPLACE INTO cases (id, payload) VALUES (?, ?)')
insert.run(sample.id, payloadStr)

fs.writeFileSync(outPath, payloadStr)

console.log('Seeded sample case to DB and wrote sample_case.json')
