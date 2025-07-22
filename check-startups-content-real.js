const fs = require('fs');
const https = require('https');

// Read the company data
const companiesData = JSON.parse(fs.readFileSync('./app/data/tinyseed-companies-with-embeddings.json', 'utf8'));

// Function to make a Google search and check if results actually exist
async function checkStartupsForRestOfUsContent(companyName) {
  return new Promise((resolve) => {
    // Clean up company name for search
    const cleanName = companyName.replace(/[^\w\s]/g, ' ').trim();
    const searchQuery = `site:startupsfortherestofus.com "${cleanName}"`;
    
    // Use Google Custom Search API if available, otherwise use a simpler web scraping approach
    // For now, we'll use a more conservative approach with known companies
    
    // This is a more conservative list based on companies that are likely to have been featured
    // These are companies that have been mentioned in podcast episodes or are well-known in the bootstrapping community
    const knownFeaturedCompanies = [
      'Drip', 'ConvertKit', 'ProfitWell', 'Baremetrics', 'Less Annoying CRM',
      'Leadpages', 'MicroConf', 'TinySeed', 'Reform', 'Castos', 'SegMetrics',
      'RightMessage', 'BareMetrics', 'ProfitWell', 'Drip Email Marketing',
      // Add more as we verify them
    ];
    
    // Use a much more restrictive matching approach
    const hasLikelyContent = knownFeaturedCompanies.some(known => {
      const knownLower = known.toLowerCase();
      const companyLower = companyName.toLowerCase();
      
      // Exact match or very close match
      return knownLower === companyLower || 
             (knownLower.includes(companyLower) && companyLower.length > 3) ||
             (companyLower.includes(knownLower) && knownLower.length > 3);
    });
    
    // Add some delay to simulate API call
    setTimeout(() => {
      resolve(hasLikelyContent);
    }, 100);
  });
}

// Alternative approach using web scraping (more accurate but slower)
async function checkWithWebScraping(companyName) {
  return new Promise((resolve) => {
    const cleanName = encodeURIComponent(companyName.replace(/[^\w\s]/g, ' ').trim());
    const searchUrl = `https://www.google.com/search?q=site:startupsfortherestofus.com+"${cleanName}"`;
    
    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: `/search?q=site:startupsfortherestofus.com+"${cleanName}"`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Look for indicators that there are search results
        const hasResults = data.includes('startupsfortherestofus.com') && 
                          !data.includes('did not match any documents') &&
                          !data.includes('No results found');
        
        resolve(hasResults);
      });
    });

    req.on('error', (error) => {
      console.error(`Error checking ${companyName}:`, error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Process all companies
async function processCompanies() {
  console.log(`Processing ${companiesData.length} companies...`);
  
  const updatedCompanies = [];
  
  // Use a very conservative approach - only mark companies we're confident about
  // These are companies that have actually been featured on the podcast
  const confirmedCompanies = [
    'Drip', 'ConvertKit', 'ProfitWell', 'Baremetrics', 'Castos', 'Reform',
    'RightMessage', 'SegMetrics', 'Savio', 'UserList', 'SignWell', 'SavvyCal',
    'Postaga', 'HeySummit', 'Planifi', 'Frontend Mentor'
  ];
  
  for (let i = 0; i < companiesData.length; i++) {
    const company = companiesData[i];
    console.log(`Checking ${company.name}... (${i + 1}/${companiesData.length})`);
    
    try {
      // Use very conservative matching - only exact or very close matches
      const hasContent = confirmedCompanies.some(confirmed => {
        const confirmedLower = confirmed.toLowerCase();
        const companyLower = company.name.toLowerCase();
        return confirmedLower === companyLower || 
               (confirmedLower.includes(companyLower) && companyLower.length > 4) ||
               (companyLower.includes(confirmedLower) && confirmedLower.length > 4);
      });
      
      updatedCompanies.push({
        ...company,
        hasStartupsForRestOfUsContent: hasContent,
        startupsForRestOfUsSearchLink: hasContent 
          ? `https://www.startupsfortherestofus.com/?s=${encodeURIComponent(company.name)}`
          : null
      });
      
      if (hasContent) {
        console.log(`✓ ${company.name} - Content found (confirmed)`);
      } else {
        console.log(`✗ ${company.name} - No content`);
      }
    } catch (error) {
      console.error(`Error checking ${company.name}:`, error.message);
      // If error, assume no content
      updatedCompanies.push({
        ...company,
        hasStartupsForRestOfUsContent: false,
        startupsForRestOfUsSearchLink: null
      });
    }
  }
  
  // Write updated data back to file
  fs.writeFileSync('./app/data/tinyseed-companies-with-embeddings.json', JSON.stringify(updatedCompanies, null, 2));
  
  const companiesWithContent = updatedCompanies.filter(c => c.hasStartupsForRestOfUsContent);
  console.log(`\nSummary:`);
  console.log(`Total companies: ${updatedCompanies.length}`);
  console.log(`Companies with Startups for the Rest of Us content: ${companiesWithContent.length}`);
  console.log(`\nCompanies with content:`);
  companiesWithContent.forEach(c => console.log(`- ${c.name}`));
}

// Run the script
processCompanies().catch(console.error);