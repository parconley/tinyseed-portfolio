const fs = require('fs');
const https = require('https');

// Read the company data
const companiesData = JSON.parse(fs.readFileSync('./app/data/tinyseed-companies-with-embeddings.json', 'utf8'));

// Function to check if a company has content on Startups for the Rest of Us
async function checkStartupsForRestOfUsContent(companyName) {
  return new Promise((resolve) => {
    const cleanName = companyName.trim();
    
    console.log(`  Checking: https://www.startupsfortherestofus.com/?s=${encodeURIComponent(cleanName)}`);
    
    const options = {
      hostname: 'www.startupsfortherestofus.com',
      port: 443,
      path: `/?s=${encodeURIComponent(cleanName)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Look for post/article elements
          const hasArticles = data.includes('class="post-title"') || 
                             data.includes('class="entry-title"') ||
                             data.includes('<article') ||
                             data.includes('class="post"');
          
          // Check for "no results" messages
          const noResults = data.includes('Nothing found') || 
                           data.includes('No posts found') ||
                           data.includes('Sorry, no posts matched') ||
                           data.includes('no results found');
          
          const finalResult = hasArticles && !noResults;
          
          console.log(`    Has articles: ${hasArticles}`);
          console.log(`    No results: ${noResults}`);
          console.log(`    Final result: ${finalResult ? 'FOUND' : 'NOT FOUND'}`);
          
          resolve(finalResult);
        } catch (error) {
          console.error(`    Error parsing response:`, error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`  Error:`, error.message);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.error(`  Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test with known companies that should have content
async function testKnownCompanies() {
  const testCompanies = [
    'Drip',
    'ConvertKit', 
    'ProfitWell',
    'Baremetrics',
    'SavvyCal',
    'Castos',
    'Reform',
    'RandomCompanyThatDoesntExist123'
  ];
  
  console.log('Testing known companies...\n');
  
  for (const companyName of testCompanies) {
    console.log(`Testing: ${companyName}`);
    const hasContent = await checkStartupsForRestOfUsContent(companyName);
    console.log(`Result: ${hasContent ? '✓ FOUND' : '✗ NOT FOUND'}\n`);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testKnownCompanies().catch(console.error);