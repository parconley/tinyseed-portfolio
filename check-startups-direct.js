const fs = require('fs');
const https = require('https');

// Read the company data
const companiesData = JSON.parse(fs.readFileSync('./app/data/tinyseed-companies-with-embeddings.json', 'utf8'));

// Function to check if a company has content on Startups for the Rest of Us
async function checkStartupsForRestOfUsContent(companyName) {
  return new Promise((resolve) => {
    // Clean up company name for search
    const cleanName = companyName.trim();
    const searchUrl = `https://www.startupsfortherestofus.com/?s=${encodeURIComponent(cleanName)}`;
    
    console.log(`  Checking: ${searchUrl}`);
    
    const options = {
      hostname: 'www.startupsfortherestofus.com',
      port: 443,
      path: `/?s=${encodeURIComponent(cleanName)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Look for indicators that there are search results
          const hasResults = data.includes('class="post-title"') || 
                           data.includes('class="entry-title"') ||
                           data.includes('class="post-excerpt"') ||
                           data.includes('<article') ||
                           (data.includes('podcast') && data.includes('episode')) ||
                           (data.includes(cleanName.toLowerCase()) && 
                            (data.includes('episode') || data.includes('podcast') || data.includes('interview')));
          
          // Also check that it's not showing "no results" or similar
          const noResults = data.includes('Nothing found') || 
                           data.includes('No posts found') ||
                           data.includes('Sorry, no posts matched your criteria') ||
                           data.includes('no results') ||
                           data.includes('0 results');
          
          const finalResult = hasResults && !noResults;
          
          console.log(`    Result: ${finalResult ? 'FOUND' : 'NOT FOUND'}`);
          if (finalResult) {
            console.log(`    URL: ${searchUrl}`);
          }
          
          resolve(finalResult);
        } catch (error) {
          console.error(`    Error parsing response for ${companyName}:`, error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`  Error checking ${companyName}:`, error.message);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      console.error(`  Timeout for ${companyName}`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Add delay between requests to be respectful
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process all companies
async function processCompanies() {
  console.log(`Processing ${companiesData.length} companies...`);
  console.log('This will take a while as we check each company individually...\n');
  
  const updatedCompanies = [];
  const companiesWithContent = [];
  
  for (let i = 0; i < companiesData.length; i++) {
    const company = companiesData[i];
    console.log(`[${i + 1}/${companiesData.length}] Checking ${company.name}...`);
    
    try {
      const hasContent = await checkStartupsForRestOfUsContent(company.name);
      
      const searchLink = hasContent 
        ? `https://www.startupsfortherestofus.com/?s=${encodeURIComponent(company.name)}`
        : null;
      
      const updatedCompany = {
        ...company,
        hasStartupsForRestOfUsContent: hasContent,
        startupsForRestOfUsSearchLink: searchLink
      };
      
      updatedCompanies.push(updatedCompany);
      
      if (hasContent) {
        companiesWithContent.push(updatedCompany);
        console.log(`  ✓ ${company.name} - Content found!`);
      } else {
        console.log(`  ✗ ${company.name} - No content`);
      }
      
      // Add delay between requests to be respectful to the server
      if (i < companiesData.length - 1) {
        await delay(2000); // 2 second delay between requests
      }
      
    } catch (error) {
      console.error(`  Error checking ${company.name}:`, error.message);
      // If error, assume no content
      updatedCompanies.push({
        ...company,
        hasStartupsForRestOfUsContent: false,
        startupsForRestOfUsSearchLink: null
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Write updated data back to file
  console.log('Saving updated data...');
  fs.writeFileSync('./app/data/tinyseed-companies-with-embeddings.json', JSON.stringify(updatedCompanies, null, 2));
  
  // Show summary
  console.log('='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total companies processed: ${updatedCompanies.length}`);
  console.log(`Companies with Startups for the Rest of Us content: ${companiesWithContent.length}`);
  console.log('');
  console.log('Companies with podcast content:');
  companiesWithContent.forEach((company, index) => {
    console.log(`${index + 1}. ${company.name}`);
    console.log(`   URL: ${company.startupsForRestOfUsSearchLink}`);
  });
  console.log('');
  console.log('Script completed successfully!');
}

// Run the script
console.log('Starting Startups for the Rest of Us content checker...');
console.log('This script will directly check the search results on startupsfortherestofus.com');
console.log('');

processCompanies().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});