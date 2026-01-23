const fs = require('fs');
const path = require('path');

// Read the files
const casesPath = path.join(__dirname, 'src', 'cases.json');
const orgsPath = path.join(__dirname, 'src', 'data', 'regulated-organisations.json');

const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
const organisations = JSON.parse(fs.readFileSync(orgsPath, 'utf8'));

// Create a mapping of organisation names to RN numbers
const orgNameToRN = {};
organisations.forEach(org => {
  orgNameToRN[org.Name] = org.RNNumber;
  if (org.Acronym) {
    orgNameToRN[org.Acronym] = org.RNNumber;
  }
});

// Add RNNumber to each case based on SubmittedBy
let updatedCount = 0;
let notFoundCount = 0;
const notFoundOrgs = new Set();

cases.forEach(caseItem => {
  if (!caseItem.RNNumber && caseItem.SubmittedBy) {
    const rnNumber = orgNameToRN[caseItem.SubmittedBy];
    if (rnNumber) {
      caseItem.RNNumber = rnNumber;
      updatedCount++;
    } else {
      notFoundOrgs.add(caseItem.SubmittedBy);
      notFoundCount++;
    }
  }
});

// Write the updated cases back
fs.writeFileSync(casesPath, JSON.stringify(cases, null, 2), 'utf8');

console.log(`✅ Updated ${updatedCount} cases with RNNumber`);
console.log(`⚠️  Could not find RNNumber for ${notFoundCount} cases`);
if (notFoundOrgs.size > 0) {
  console.log('\nOrganisations not found in regulated-organisations.json:');
  notFoundOrgs.forEach(org => console.log(`  - ${org}`));
}
