const fs = require('fs');
const path = require('path');

// Function to convert "Season Year" to "Year Season" or "Season Year Region" to "Year Season Region"
function convertCohortFormat(cohort) {
  if (!cohort) return cohort;
  
  const parts = cohort.split(' ');
  if (parts.length >= 2) {
    const [season, year, ...rest] = parts;
    // Check if second part is a year (4 digits)
    if (/^\d{4}$/.test(year)) {
      return rest.length > 0 ? `${year} ${season} ${rest.join(' ')}` : `${year} ${season}`;
    }
  }
  return cohort;
}

// Update main companies file
const companiesPath = path.join(__dirname, '../app/data/tinyseed-companies.json');
const companiesData = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

const updatedCompanies = companiesData.map(company => ({
  ...company,
  cohort: convertCohortFormat(company.cohort)
}));

fs.writeFileSync(companiesPath, JSON.stringify(updatedCompanies, null, 2));
console.log('Updated tinyseed-companies.json');

// Update companies with embeddings file
const embeddingsPath = path.join(__dirname, '../app/data/tinyseed-companies-with-embeddings.json');
if (fs.existsSync(embeddingsPath)) {
  const embeddingsData = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));
  
  const updatedEmbeddings = embeddingsData.map(company => ({
    ...company,
    cohort: convertCohortFormat(company.cohort)
  }));
  
  fs.writeFileSync(embeddingsPath, JSON.stringify(updatedEmbeddings, null, 2));
  console.log('Updated tinyseed-companies-with-embeddings.json');
}

// Update old companies file if it exists
const oldPath = path.join(__dirname, '../app/data/tinyseed-companies-old.json');
if (fs.existsSync(oldPath)) {
  const oldData = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  
  const updatedOld = oldData.map(company => ({
    ...company,
    cohort: convertCohortFormat(company.cohort)
  }));
  
  fs.writeFileSync(oldPath, JSON.stringify(updatedOld, null, 2));
  console.log('Updated tinyseed-companies-old.json');
}

// Update CSV file
const csvPath = path.join(__dirname, '../tinyseed_portfolio_companies_extracted.csv');
if (fs.existsSync(csvPath)) {
  let csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Replace all occurrences of "Season Year" pattern in CSV
  csvContent = csvContent.replace(/\b(Spring|Summer|Fall|Winter)\s+(\d{4})\b/g, '$2 $1');
  
  fs.writeFileSync(csvPath, csvContent);
  console.log('Updated CSV file');
}

console.log('All cohort formats have been updated!');