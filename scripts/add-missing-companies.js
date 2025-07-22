const fs = require('fs');

// Read the CSV file
const csvContent = fs.readFileSync('./tinyseed_portfolio_companies_extracted.csv', 'utf-8');

// Parse CSV manually
const lines = csvContent.split('\n').filter(line => line.trim());
const records = [];

for (let i = 1; i < lines.length; i++) { // Skip header
  const line = lines[i];
  // Simple CSV parsing - handles quoted fields with commas
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  
  if (parts.length >= 5) {
    records.push({
      name: parts[0].trim(),
      website: parts[1].trim(),
      description: parts[2].trim(),
      batch: parts[3].trim(),
      location: parts[4].trim()
    });
  }
}

// Read the existing JSON file
const jsonContent = fs.readFileSync('./app/data/tinyseed-companies.json', 'utf-8');
const existingCompanies = JSON.parse(jsonContent);

// Create a set of existing company names for quick lookup
const existingNames = new Set(existingCompanies.map(c => c.name.toLowerCase()));

// Find companies in CSV that are not in JSON
const missingCompanies = records.filter(record => {
  let name = record.name?.trim();
  
  // For entries without names, derive from website URL
  if (!name && record.website) {
    const url = record.website.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (url.includes('fleetworks')) name = 'Fleetworks';
    else if (url.includes('anchorpoint')) name = 'Anchorpoint';
    else if (url.includes('trackmybusiness')) name = 'Track My Business';
    else if (url.includes('stridist')) name = 'Stridist';
    else if (url.includes('presspublish')) name = 'Press Publish';
    else if (url.includes('plainlyvideos')) name = 'Plainly';
    else if (url.includes('jetplan')) name = 'JETPLAN';
    else if (url.includes('frontendmentor')) name = 'Frontend Mentor';
    else if (url.includes('findymail')) name = 'Findymail';
    else if (url.includes('desku')) name = 'Desku';
    
    if (name) record.name = name;
  }
  
  return name && !existingNames.has(name.toLowerCase());
});

console.log(`Found ${missingCompanies.length} companies in CSV that are missing from JSON`);

// Convert missing companies to JSON format
const newCompanies = missingCompanies.map((company, index) => {
  const id = `ts-${String(existingCompanies.length + index + 1).padStart(3, '0')}`;
  
  // Determine tags based on description
  const tags = [];
  const desc = company.description?.toLowerCase() || '';
  
  if (desc.includes('ai') || desc.includes('automat')) tags.push('AI');
  if (desc.includes('saas')) tags.push('SaaS');
  if (desc.includes('market')) tags.push('Marketing');
  if (desc.includes('email')) tags.push('Email');
  if (desc.includes('analytic')) tags.push('Analytics');
  if (desc.includes('payment') || desc.includes('billing')) tags.push('Payments');
  if (desc.includes('real estate')) tags.push('Real Estate');
  if (desc.includes('health')) tags.push('Healthcare');
  if (desc.includes('legal') || desc.includes('law')) tags.push('Legal');
  if (desc.includes('finance') || desc.includes('account')) tags.push('Finance');
  
  // Determine category
  let category = 'Other';
  if (tags.includes('AI')) category = 'AI & Automation';
  else if (tags.includes('Marketing') || tags.includes('Email')) category = 'Marketing & Sales';
  else if (tags.includes('Analytics')) category = 'Analytics & Data';
  else if (tags.includes('Finance') || tags.includes('Payments')) category = 'FinTech';
  else if (tags.includes('Real Estate')) category = 'Real Estate';
  else if (tags.includes('Healthcare')) category = 'Healthcare';
  else if (tags.includes('Legal')) category = 'Legal';
  
  // Pick an icon based on category
  const iconMap = {
    'AI & Automation': '🤖',
    'Marketing & Sales': '📈',
    'Analytics & Data': '📊',
    'FinTech': '💰',
    'Real Estate': '🏠',
    'Healthcare': '🏥',
    'Legal': '⚖️',
    'Other': '💼'
  };
  
  return {
    id,
    name: company.name.trim(),
    cohort: company.batch || 'Unknown',
    tags: tags.length > 0 ? tags : ['SaaS'],
    description: company.description || '',
    location: company.location || 'Unknown',
    website: company.website || '',
    category,
    icon: iconMap[category] || '💼',
    crunchbaseLink: `https://www.crunchbase.com/organization/${company.name.toLowerCase().replace(/\s+/g, '-')}`,
    googleSearchLink: `https://www.google.com/search?q=site:startupsfortherestofus.com+"${company.name}"`
  };
});

// Combine existing and new companies
const allCompanies = [...existingCompanies, ...newCompanies];

// Write the updated JSON file
fs.writeFileSync('./app/data/tinyseed-companies.json', JSON.stringify(allCompanies, null, 2));

console.log(`Successfully added ${newCompanies.length} companies to the JSON file`);
console.log(`Total companies now: ${allCompanies.length}`);