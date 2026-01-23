const fs = require('fs');
const path = require('path');

const CASES_PATH = path.join(__dirname, 'src', 'cases.json');
const DEMO_ORG = 'Assessment Partners UK';
const DEMO_RN = 'RN5123';

const TARGETS = [
  { type: 'event notification', count: 4 },
  { type: 'expansion application', count: 1 },
  { type: 'information request', count: 13 },
  { type: 'information notice b4', count: 5 },
  { type: 'complaint', count: 4 },
];

function normalizeType(type) {
  return type.trim().toLowerCase();
}

function main() {
  const cases = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
  const updated = new Set();
  for (const { type, count } of TARGETS) {
    let n = 0;
    for (const c of cases) {
      if (n >= count) break;
      if (normalizeType(c.CaseType || '') === type && c.SubmittedBy !== DEMO_ORG) {
        c.SubmittedBy = DEMO_ORG;
        c.RNNumber = DEMO_RN;
        updated.add(c.CaseID);
        n++;
      }
    }
  }
  fs.writeFileSync(CASES_PATH, JSON.stringify(cases, null, 2));
  console.log(`Updated cases: ${Array.from(updated).join(', ')}`);
}

main();
