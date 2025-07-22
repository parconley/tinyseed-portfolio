#!/usr/bin/env node

/**
 * Script to scrape all TinySeed portfolio companies from tinyseed.com/portfolio
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../app/data/tinyseed-companies.json');

// Function to fetch webpage content with proper headers
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
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
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Function to extract companies from HTML
function extractCompanies(html) {
  const companies = [];
  
  // Extract companies using regex patterns
  // Look for company entries with names, descriptions, etc.
  
  // This is a basic pattern - would need to adjust based on actual HTML structure
  const companyPattern = /<div[^>]*class="[^"]*company[^"]*"[^>]*>(.*?)<\/div>/gis;
  
  let match;
  let id = 1;
  
  while ((match = companyPattern.exec(html)) !== null) {
    const companyHtml = match[1];
    
    // Extract company details from the HTML block
    const nameMatch = companyHtml.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    const descMatch = companyHtml.match(/<p[^>]*>(.*?)<\/p>/i);
    const linkMatch = companyHtml.match(/href="([^"]*)"/) || companyHtml.match(/https?:\/\/[^\s<>"']+/);
    
    if (nameMatch) {
      const company = {
        id: `company-${id++}`,
        name: nameMatch[1].replace(/<[^>]*>/g, '').trim(),
        description: descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '',
        website: linkMatch ? linkMatch[1] : '',
        cohort: 'Unknown',
        location: 'Unknown',
        category: 'Unknown',
        tags: [],
        crunchbaseLink: `https://www.crunchbase.com/organization/${nameMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        googleSearchLink: `https://www.google.com/search?q=site:https://www.startupsfortherestofus.com+"${nameMatch[1].replace(/"/g, '\\"')}"`
      };
      
      companies.push(company);
    }
  }
  
  return companies;
}

// Main scraping function
async function scrapePortfolio() {
  console.log('🕷️  Starting TinySeed portfolio scrape...');
  
  try {
    console.log('📥 Fetching portfolio page...');
    const html = await fetchPage('https://tinyseed.com/portfolio');
    
    console.log('🔍 Extracting company data...');
    const companies = extractCompanies(html);
    
    if (companies.length === 0) {
      console.log('⚠️  No companies found. The HTML structure may have changed.');
      console.log('📝 Saving raw HTML for debugging...');
      fs.writeFileSync(path.join(__dirname, 'debug.html'), html);
      console.log('💾 Raw HTML saved to debug.html');
      return;
    }
    
    console.log(`✅ Found ${companies.length} companies`);
    
    // Save to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(companies, null, 2));
    console.log(`💾 Saved ${companies.length} companies to ${OUTPUT_FILE}`);
    
    // Show first few companies as sample
    console.log('\n📋 Sample companies:');
    companies.slice(0, 3).forEach(company => {
      console.log(`  • ${company.name}: ${company.description.substring(0, 60)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the scraper
if (require.main === module) {
  scrapePortfolio().catch(console.error);
}

module.exports = { scrapePortfolio, extractCompanies };