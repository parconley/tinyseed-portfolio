const fs = require('fs');

// Read the CSV file
const csvContent = fs.readFileSync('./tinyseed_portfolio_companies_extracted.csv', 'utf-8');

// Parse CSV manually
const lines = csvContent.split('\n').filter(line => line.trim());
const csvCompanies = [];

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
    let name = parts[0].trim();
    const website = parts[1].trim();
    const description = parts[2].trim();
    const batch = parts[3].trim();
    const location = parts[4].trim();
    
    // For entries without names, derive from website URL
    if (!name && website) {
      const url = website.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '');
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
    }
    
    if (name || website || description) {
      csvCompanies.push({
        name: name || 'Unknown',
        website,
        description,
        batch,
        location
      });
    }
  }
}

// Read the existing JSON file
const jsonContent = fs.readFileSync('./app/data/tinyseed-companies.json', 'utf-8');
const existingCompanies = JSON.parse(jsonContent);

// Create a set of existing company names for quick lookup
const existingNames = new Set(existingCompanies.map(c => c.name.toLowerCase()));

// Find companies in CSV that are not in JSON
const newCompanies = [];
let addedCount = 0;

csvCompanies.forEach(csvCompany => {
  const name = csvCompany.name;
  
  if (!existingNames.has(name.toLowerCase())) {
    addedCount++;
    const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${csvCompany.batch.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Determine tags based on description
    const tags = [];
    const desc = csvCompany.description?.toLowerCase() || '';
    
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
    if (desc.includes('data')) tags.push('Data');
    if (desc.includes('customer')) tags.push('Customer Success');
    if (desc.includes('produc')) tags.push('Product Management');
    if (desc.includes('securit')) tags.push('Security');
    if (desc.includes('educat') || desc.includes('learn')) tags.push('Education');
    
    // Determine category
    let category = 'Other';
    let subcategory = 'General';
    
    if (tags.includes('AI')) {
      category = 'AI & Automation';
      subcategory = 'AI Solutions';
    } else if (tags.includes('Marketing') || tags.includes('Email')) {
      category = 'Marketing Technology';
      subcategory = tags.includes('Email') ? 'Email Marketing' : 'Marketing Automation';
    } else if (tags.includes('Analytics') || tags.includes('Data')) {
      category = 'Analytics';
      subcategory = 'Data Analytics';
    } else if (tags.includes('Finance') || tags.includes('Payments')) {
      category = 'Financial Technology';
      subcategory = tags.includes('Payments') ? 'Payment Processing' : 'Financial Services';
    } else if (tags.includes('Real Estate')) {
      category = 'Real Estate Technology';
      subcategory = 'Property Management';
    } else if (tags.includes('Healthcare')) {
      category = 'Healthcare Technology';
      subcategory = 'Health Services';
    } else if (tags.includes('Legal')) {
      category = 'Legal Technology';
      subcategory = 'Legal Services';
    } else if (tags.includes('Education')) {
      category = 'Education Technology';
      subcategory = 'Learning Platform';
    } else if (tags.includes('Security')) {
      category = 'Security';
      subcategory = 'Cybersecurity';
    } else if (tags.includes('Customer Success')) {
      category = 'Customer Communication';
      subcategory = 'Customer Support';
    }
    
    // Ensure we have at least one tag
    if (tags.length === 0) {
      tags.push('SaaS');
    }
    
    const newCompany = {
      id,
      name: csvCompany.name,
      description: csvCompany.description || 'Company description pending.',
      category,
      subcategory,
      foundedYear: 2020, // Default year
      website: csvCompany.website || '',
      status: 'Active',
      cohort: csvCompany.batch || 'Unknown',
      founders: [],
      location: csvCompany.location || 'Unknown',
      tags,
      revenue: 'Not disclosed',
      employees: 'Not disclosed',
      funding: '$120K', // TinySeed standard
      lastUpdate: new Date().toISOString().split('T')[0],
      logo: `/logos/${name.toLowerCase().replace(/\s+/g, '-')}.png`
    };
    
    newCompanies.push(newCompany);
  }
});

// Combine existing and new companies
const allCompanies = [...existingCompanies, ...newCompanies];

// Write the updated JSON file
fs.writeFileSync('./app/data/tinyseed-companies.json', JSON.stringify(allCompanies, null, 2));

console.log(`Successfully added ${addedCount} companies from CSV to JSON`);
console.log(`Total companies now: ${allCompanies.length}`);