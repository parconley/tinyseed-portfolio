const https = require('https');

// Function to debug what the search page actually returns
async function debugSearch(companyName) {
  return new Promise((resolve) => {
    const cleanName = companyName.trim();
    
    console.log(`Checking: ${companyName}`);
    console.log(`URL: https://www.startupsfortherestofus.com/?s=${encodeURIComponent(cleanName)}`);
    
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
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content length: ${data.length}`);
        
        // Look for various indicators
        const indicators = {
          'class="post-title"': data.includes('class="post-title"'),
          'class="entry-title"': data.includes('class="entry-title"'),
          'class="post-excerpt"': data.includes('class="post-excerpt"'),
          '<article': data.includes('<article'),
          'class="post"': data.includes('class="post"'),
          '"Nothing found"': data.includes('Nothing found'),
          '"No posts found"': data.includes('No posts found'),
          'no results': data.includes('no results'),
          'Sorry, no posts matched': data.includes('Sorry, no posts matched'),
          'search-results': data.includes('search-results'),
          'wp-block-post-title': data.includes('wp-block-post-title'),
          'entry-header': data.includes('entry-header')
        };
        
        console.log('Indicators found:');
        Object.entries(indicators).forEach(([key, found]) => {
          console.log(`  ${key}: ${found}`);
        });
        
        // Show first 500 chars of response
        console.log('\nFirst 500 characters of response:');
        console.log(data.substring(0, 500));
        console.log('...\n');
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Error:`, error.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.error(`Timeout`);
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Test with a few companies
async function debugTest() {
  const companies = ['Drip', 'SavvyCal', 'ConvertKit'];
  
  for (const company of companies) {
    await debugSearch(company);
    console.log('='.repeat(80));
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

debugTest().catch(console.error);