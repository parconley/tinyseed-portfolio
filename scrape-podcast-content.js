const fs = require('fs');
const https = require('https');

// Read the company data
const companiesData = JSON.parse(fs.readFileSync('./app/data/tinyseed-companies-with-embeddings.json', 'utf8'));

// Function to check if a company has content by scraping the search page
async function checkPodcastContent(companyName) {
  return new Promise((resolve) => {
    const cleanName = companyName.trim();
    const searchPath = `/?s=${encodeURIComponent(cleanName)}`;
    
    console.log(`  Searching for: ${companyName}`);
    console.log(`  URL: https://www.startupsfortherestofus.com${searchPath}`);
    
    const options = {
      hostname: 'www.startupsfortherestofus.com',
      port: 443,
      path: searchPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity', // Don't compress to make parsing easier
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Connection': 'keep-alive'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`    Status: ${res.statusCode}`);
      
      // If we get redirected or blocked, try to handle it
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`    Redirected to: ${res.headers.location}`);
        resolve(false);
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // Check if we got the Cloudflare challenge page
          if (data.includes('Just a moment') || data.includes('Cloudflare') || data.includes('challenge-form')) {
            console.log(`    ⚠️  Blocked by Cloudflare protection`);
            resolve(false);
            return;
          }
          
          // Look for indicators that there are actual search results
          const indicators = {
            // WordPress post indicators
            hasPostTitle: data.includes('class="entry-title"') || data.includes('class="post-title"'),
            hasPostContent: data.includes('class="entry-content"') || data.includes('class="post-content"'),
            hasArticles: data.includes('<article') && data.includes('class="post'),
            hasPostExcerpt: data.includes('class="entry-summary"') || data.includes('class="post-excerpt'),
            
            // WordPress search result indicators
            hasSearchResults: data.includes('search-results') || data.includes('search-result'),
            hasEntryHeader: data.includes('entry-header'),
            
            // Content indicators
            hasEpisodeContent: (data.toLowerCase().includes('episode') || data.toLowerCase().includes('podcast')) && 
                              (data.includes('entry-title') || data.includes('post-title')),
            
            // Negative indicators
            hasNoResults: data.includes('Nothing found') || 
                         data.includes('No posts found') || 
                         data.includes('Sorry, no posts matched') ||
                         data.includes('no results') ||
                         data.includes('0 results') ||
                         data.includes('No results found'),
            
            hasEmptySearch: data.includes('search-no-results') || data.includes('no-search-results')
          };
          
          // A company has content if there are post indicators and no "no results" messages
          const hasContent = (indicators.hasPostTitle || indicators.hasPostContent || 
                             indicators.hasArticles || indicators.hasSearchResults ||
                             indicators.hasEpisodeContent) && 
                            !indicators.hasNoResults && !indicators.hasEmptySearch;
          
          console.log(`    Indicators:`, {
            posts: indicators.hasPostTitle || indicators.hasPostContent,
            articles: indicators.hasArticles,
            episodes: indicators.hasEpisodeContent,
            noResults: indicators.hasNoResults,
            final: hasContent ? 'FOUND' : 'NOT FOUND'
          });
          
          resolve(hasContent);
          
        } catch (error) {
          console.error(`    Error parsing response: ${error.message}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`    Request error: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(15000, () => {
      console.error(`    Timeout after 15 seconds`);
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
async function processAllCompanies() {
  console.log(`🔍 Checking all ${companiesData.length} companies for podcast content...`);
  console.log('⚠️  This may take a while due to rate limiting and potential Cloudflare protection\n');
  
  const results = [];
  let successCount = 0;
  let blockedCount = 0;
  
  for (let i = 0; i < companiesData.length; i++) {
    const company = companiesData[i];
    console.log(`[${i + 1}/${companiesData.length}] ${company.name}`);
    
    try {
      const hasContent = await checkPodcastContent(company.name);
      
      const updatedCompany = {
        ...company,
        hasStartupsForRestOfUsContent: hasContent,
        startupsForRestOfUsSearchLink: hasContent 
          ? `https://www.startupsfortherestofus.com/?s=${encodeURIComponent(company.name)}`
          : null
      };
      
      results.push(updatedCompany);
      
      if (hasContent) {
        console.log(`    ✅ FOUND - ${company.name} has podcast content`);
        successCount++;
      } else {
        console.log(`    ❌ NOT FOUND - ${company.name} has no podcast content`);
      }
      
    } catch (error) {
      console.error(`    💥 ERROR checking ${company.name}: ${error.message}`);
      blockedCount++;
      
      // If error, assume no content
      results.push({
        ...company,
        hasStartupsForRestOfUsContent: false,
        startupsForRestOfUsSearchLink: null
      });
    }
    
    // Add delay between requests (3 seconds to be very respectful)
    if (i < companiesData.length - 1) {
      console.log(`    ⏱️  Waiting 3 seconds before next request...\n`);
      await delay(3000);
    }
  }
  
  // Save results
  console.log('\n💾 Saving results to file...');
  fs.writeFileSync('./app/data/tinyseed-companies-with-embeddings.json', JSON.stringify(results, null, 2));
  
  // Show summary
  const companiesWithContent = results.filter(c => c.hasStartupsForRestOfUsContent);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total companies processed: ${results.length}`);
  console.log(`Companies with podcast content: ${companiesWithContent.length}`);
  console.log(`Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
  if (blockedCount > 0) {
    console.log(`⚠️  Requests blocked/failed: ${blockedCount}`);
  }
  
  console.log('\n🎙️ Companies with podcast content:');
  companiesWithContent.forEach((company, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${company.name}`);
    console.log(`    🔗 ${company.startupsForRestOfUsSearchLink}`);
  });
  
  console.log('\n✅ Script completed successfully!');
  console.log(`📈 Found ${companiesWithContent.length} companies with podcast content`);
  
  return companiesWithContent.length;
}

// Run the script
console.log('🚀 Starting podcast content scraper...');
console.log('📡 This will check each company on startupsfortherestofus.com');
console.log('⏰ Expected time: ~10-15 minutes for all companies\n');

processAllCompanies()
  .then(count => {
    if (count >= 12 && count <= 128) {
      console.log(`🎯 Perfect! Found ${count} companies (between 12-128 as expected)`);
    } else if (count < 12) {
      console.log(`⚠️  Found only ${count} companies (less than expected 12+)`);
    } else {
      console.log(`⚠️  Found ${count} companies (more than expected 128)`);
    }
  })
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });