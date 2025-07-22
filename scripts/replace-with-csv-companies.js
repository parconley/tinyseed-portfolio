const fs = require('fs');

// Read the CSV file
const csvContent = fs.readFileSync('./tinyseed_portfolio_companies_extracted.csv', 'utf-8');

// Parse CSV manually
const lines = csvContent.split('\n').filter(line => line.trim());
const newCompanies = [];

for (let i = 1; i < lines.length; i++) { // Skip header
  const line = lines[i];
  if (!line.trim()) continue;
  
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
      else {
        // Extract domain name as fallback
        const domain = url.split('.')[0];
        name = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
    }
    
    if (name && (website || description)) {
      const id = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${batch.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      // Determine tags based on description
      const tags = [];
      const desc = description?.toLowerCase() || '';
      
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
      if (desc.includes('ecommerce') || desc.includes('e-commerce')) tags.push('E-commerce');
      if (desc.includes('video')) tags.push('Video');
      if (desc.includes('social')) tags.push('Social');
      
      // Determine category
      let category = 'Other';
      
      if (tags.includes('AI')) {
        category = 'AI & Automation';
      } else if (tags.includes('Marketing') || tags.includes('Email')) {
        category = 'Marketing Technology';
      } else if (tags.includes('Analytics') || tags.includes('Data')) {
        category = 'Analytics';
      } else if (tags.includes('Finance') || tags.includes('Payments')) {
        category = 'Financial Technology';
      } else if (tags.includes('Real Estate')) {
        category = 'Real Estate Technology';
      } else if (tags.includes('Healthcare')) {
        category = 'Healthcare Technology';
      } else if (tags.includes('Legal')) {
        category = 'Legal Technology';
      } else if (tags.includes('Education')) {
        category = 'Education Technology';
      } else if (tags.includes('Security')) {
        category = 'Security';
      } else if (tags.includes('Customer Success')) {
        category = 'Customer Communication';
      } else if (tags.includes('E-commerce')) {
        category = 'E-commerce';
      } else if (tags.includes('Video')) {
        category = 'Media & Content';
      }
      
      // Ensure we have at least one tag
      if (tags.length === 0) {
        tags.push('SaaS');
      }
      
      const company = {
        id,
        name,
        description: description || 'Company description pending.',
        category,
        website: website || '',
        cohort: batch || 'Unknown',
        location: location || 'Unknown',
        tags,
        crunchbaseLink: `https://www.crunchbase.com/organization/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        googleSearchLink: `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + (website || ''))}`
      };
      
      newCompanies.push(company);
    }
  }
}

// Write the new companies to the JSON file, replacing all existing data
fs.writeFileSync('./app/data/tinyseed-companies.json', JSON.stringify(newCompanies, null, 2));

console.log(`Successfully replaced all companies with ${newCompanies.length} companies from CSV`);
console.log('Companies have been completely replaced with CSV data');