#!/usr/bin/env node

/**
 * Script to validate company URLs and update company data
 * This script checks if URLs are reachable and formats them correctly
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const COMPANIES_FILE = path.join(__dirname, '../app/data/tinyseed-companies.json');

// Function to test if a URL is reachable
function testUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TinySeed-Validator/1.0)'
      }
    };

    const req = client.request(options, (res) => {
      resolve({
        url: url,
        status: res.statusCode,
        reachable: res.statusCode >= 200 && res.statusCode < 400,
        redirected: res.statusCode >= 300 && res.statusCode < 400,
        location: res.headers.location
      });
    });

    req.on('error', (err) => {
      resolve({
        url: url,
        status: 0,
        reachable: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      resolve({
        url: url,
        status: 0,
        reachable: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

// Function to normalize URL format
function normalizeUrl(url) {
  try {
    // Add https:// if no protocol specified
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Remove trailing slash
    if (urlObj.pathname === '/') {
      urlObj.pathname = '';
    }
    
    return urlObj.toString();
  } catch (error) {
    console.error(`Invalid URL: ${url}`);
    return url;
  }
}

// Main function to update companies
async function updateCompanies() {
  console.log('🔍 Loading company data...');
  
  let companies;
  try {
    companies = JSON.parse(fs.readFileSync(COMPANIES_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading companies file:', error);
    process.exit(1);
  }

  console.log(`📊 Found ${companies.length} companies`);
  console.log('🌐 Validating URLs...\n');

  let updated = 0;
  let reachable = 0;
  let unreachable = 0;

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const originalUrl = company.website;
    const normalizedUrl = normalizeUrl(originalUrl);
    
    process.stdout.write(`[${i + 1}/${companies.length}] ${company.name}: `);
    
    // Update URL if it was normalized
    if (normalizedUrl !== originalUrl) {
      company.website = normalizedUrl;
      updated++;
      process.stdout.write(`📝 URL updated → `);
    }
    
    // Test URL reachability
    const result = await testUrl(normalizedUrl);
    
    if (result.reachable) {
      console.log(`✅ ${result.status}`);
      reachable++;
    } else {
      console.log(`❌ ${result.error || result.status}`);
      unreachable++;
    }
    
    // Small delay to be respectful to servers
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save updated companies
  if (updated > 0) {
    try {
      fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
      console.log(`\n💾 Updated ${updated} URLs and saved to file`);
    } catch (error) {
      console.error('❌ Error saving companies file:', error);
    }
  }

  console.log('\n📈 Summary:');
  console.log(`✅ Reachable: ${reachable}`);
  console.log(`❌ Unreachable: ${unreachable}`);
  console.log(`📝 URLs updated: ${updated}`);
}

// Run the script
if (require.main === module) {
  updateCompanies().catch(console.error);
}

module.exports = { testUrl, normalizeUrl, updateCompanies };