#!/usr/bin/env node

/**
 * Manual data extraction and formatting for TinySeed companies
 * Since web scraping is blocked, we'll manually input the data
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../app/data/tinyseed-companies.json');

// Manually extracted TinySeed portfolio companies
// This data would need to be manually gathered from the website
const tinyseedCompanies = [
  // Spring 2025 Cohort
  {
    id: "company-1",
    name: "Assemblia",
    cohort: "Spring 2025",
    tags: ["AI", "Automation", "SaaS"],
    description: "Builds highly customized AI automations to help government relations teams monitor, analyze and report on legislative activity.",
    location: "Portugal",
    website: "https://assemblia.ai",
    category: "AI & Automation",
    crunchbaseLink: "https://www.crunchbase.com/organization/assemblia",
    googleSearchLink: 'https://www.google.com/search?q=site:https://www.startupsfortherestofus.com+"Assemblia"'
  },
  {
    id: "company-2", 
    name: "4admin",
    cohort: "Spring 2025",
    tags: ["AI", "SaaS"],
    description: "Helps financial advisers scale using AI purpose-built for their complex back-office operations.",
    location: "UK",
    website: "https://4admin.co.uk/",
    category: "AI & Automation",
    crunchbaseLink: "https://www.crunchbase.com/organization/4admin",
    googleSearchLink: 'https://www.google.com/search?q=site:https://www.startupsfortherestofus.com+"4admin"'
  },
  {
    id: "company-3",
    name: "CargoFax", 
    cohort: "Spring 2025",
    tags: ["Platform", "SaaS"],
    description: "Offers a web-based platform that democratizes trade data, providing actionable insights.",
    location: "Florida, Brazil",
    website: "https://www.cargofax.co/",
    category: "Analytics & Data",
    crunchbaseLink: "https://www.crunchbase.com/organization/cargofax",
    googleSearchLink: 'https://www.google.com/search?q=site:https://www.startupsfortherestofus.com+"CargoFax"'
  }
  // TODO: Add remaining ~195 companies...
];

async function main() {
  console.log('📋 Creating TinySeed companies database...');
  console.log(`📊 Currently have ${tinyseedCompanies.length} companies`);
  console.log('⚠️  This is a subset - need to manually add all ~198 companies');
  
  // Save current data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tinyseedCompanies, null, 2));
  console.log(`💾 Saved ${tinyseedCompanies.length} companies to ${OUTPUT_FILE}`);
  
  console.log('\n📋 Sample companies:');
  tinyseedCompanies.forEach(company => {
    console.log(`  • ${company.name} (${company.cohort}): ${company.description.substring(0, 60)}...`);
  });
  
  console.log('\n🚨 NEXT STEPS:');
  console.log('1. Manually gather all company data from https://tinyseed.com/portfolio');
  console.log('2. Add each company to the tinyseedCompanies array');
  console.log('3. Re-run this script to generate the complete dataset');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { tinyseedCompanies };