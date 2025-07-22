#!/usr/bin/env node

/**
 * Compile complete TinySeed portfolio from extracted data
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../app/data/tinyseed-companies.json');

// Compiled companies from web scraping
const allTinySeedCompanies = [
  // Spring 2025 - From initial data
  {
    id: "ts-001",
    name: "Assemblia",
    cohort: "Spring 2025",
    tags: ["AI", "Government", "Automation"],
    description: "Builds highly customized AI automations to help government relations teams monitor, analyze and report on legislative activity.",
    location: "Portugal",
    website: "https://assemblia.ai",
    category: "AI & Government"
  },
  {
    id: "ts-002",
    name: "4admin",
    cohort: "Spring 2025",
    tags: ["AI", "FinTech", "SaaS"],
    description: "Helps financial advisers scale using AI purpose-built for their complex back-office operations.",
    location: "UK",
    website: "https://4admin.co.uk/",
    category: "FinTech"
  },
  {
    id: "ts-003",
    name: "CargoFax",
    cohort: "Spring 2025",
    tags: ["Logistics", "Data", "Analytics"],
    description: "Web-based platform that democratizes trade data, providing actionable insights through visualizations and dashboards.",
    location: "Florida, Brazil",
    website: "https://www.cargofax.co/",
    category: "Logistics & Trade"
  },

  // Fall 2024 Americas - From WebFetch
  {
    id: "ts-004",
    name: "VendorSage",
    cohort: "Fall 2024 Americas",
    tags: ["SaaS", "Procurement"],
    description: "Software and community helping organisations get more value out of every dollar they spend on software",
    location: "New Zealand",
    website: "https://www.vendorsage.com/",
    category: "SaaS"
  },
  {
    id: "ts-005",
    name: "TeamFluence",
    cohort: "Fall 2024 Americas",
    tags: ["Sales", "LinkedIn"],
    description: "Cloud platform helping B2B companies fill sales pipeline from LinkedIn without spam",
    location: "Germany",
    website: "https://myteamfluence.com",
    category: "Sales"
  },
  {
    id: "ts-006",
    name: "Sitio",
    cohort: "Fall 2024 Americas",
    tags: ["Web Services", "Performance"],
    description: "Digital governance platform helping organizations optimize websites for performance, accessibility, and user experience",
    location: "Colorado",
    website: "https://sitio.ai/",
    category: "Web Services"
  },
  {
    id: "ts-007",
    name: "SeeStuff",
    cohort: "Fall 2024 Americas",
    tags: ["PropTech", "Property Management"],
    description: "Integrated ecosystem streamlining software systems for commercial property management",
    location: "New Zealand, Philippines",
    website: "https://seestuff.net/",
    category: "PropTech"
  },
  {
    id: "ts-008",
    name: "ScaleList",
    cohort: "Fall 2024 Americas",
    tags: ["Sales", "Prospecting"],
    description: "Platform helping salespeople create perfect prospect lists and track contact changes",
    location: "Hong Kong, Singapore",
    website: "https://scalelist.com",
    category: "Sales"
  },
  {
    id: "ts-009",
    name: "PackemWMS",
    cohort: "Fall 2024 Americas",
    tags: ["Logistics", "Warehouse"],
    description: "Warehouse management software designed to be accessible and affordable for brands and 3PL companies",
    location: "Florida",
    website: "https://packemwms.com",
    category: "Logistics"
  },

  // Fall 2024 EMEA - From WebFetch
  {
    id: "ts-010",
    name: "Checkout Page",
    cohort: "Fall 2024 EMEA",
    tags: ["Payments", "No-Code"],
    description: "Transforming how businesses accept payments online with the most flexible, no-code checkout page builder on the market",
    location: "Netherlands",
    website: "https://checkoutpage.co/",
    category: "Payments"
  },
  {
    id: "ts-011",
    name: "easyreview",
    cohort: "Fall 2024 EMEA",
    tags: ["HR", "Performance"],
    description: "Powerful talent management platform that helps busy HR teams foster a more engaged, high-performing, and loyal workforce",
    location: "Germany",
    website: "https://www.easy-review.de/",
    category: "HR"
  },
  {
    id: "ts-012",
    name: "Marllm",
    cohort: "Fall 2024 EMEA",
    tags: ["AI", "Marketing"],
    description: "Helps businesses scale customised sales funnels using human-centric content AI co-workers",
    location: "UK",
    website: "https://marllm.io",
    category: "AI"
  },
  {
    id: "ts-013",
    name: "OneAccord",
    cohort: "Fall 2024 EMEA",
    tags: ["AI", "Translation"],
    description: "Live AI translation platform for churches, bridging language gaps to make church services accessible to everyone",
    location: "Spain",
    website: "https://www.oneaccord.ai",
    category: "AI"
  },
  {
    id: "ts-014",
    name: "Remea",
    cohort: "Fall 2024 EMEA",
    tags: ["EV", "Energy"],
    description: "Smart EV charging management platform tailored for businesses in the hospitality and SMB sectors",
    location: "Slovenia",
    website: "https://remea.io",
    category: "SaaS"
  },

  // Spring 2024 Americas - From WebFetch  
  {
    id: "ts-015",
    name: "Zitles",
    cohort: "Spring 2024 Americas",
    tags: ["Real Estate", "Title"],
    description: "Modernizes archaic real estate title search and review processes",
    location: "South Carolina",
    website: "https://www.zitles.com",
    category: "Real Estate"
  },
  {
    id: "ts-016",
    name: "Userdoc",
    cohort: "Spring 2024 Americas",
    tags: ["AI", "Requirements"],
    description: "AI supercharges software requirements, allowing scoping systems in minutes",
    location: "Australia",
    website: "https://userdoc.fyi",
    category: "AI"
  },
  {
    id: "ts-017",
    name: "Trotto",
    cohort: "Spring 2024 Americas",
    tags: ["Developer Tools", "URL"],
    description: "Enterprise go links provider, internal URL shortener for teams",
    location: "Washington",
    website: "https://www.trot.to",
    category: "Developer Tools"
  },
  {
    id: "ts-018",
    name: "TOOLTRIBE",
    cohort: "Spring 2024 Americas",
    tags: ["Tools", "Inventory"],
    description: "Tool inventory app built for job sites to track tools for employees",
    location: "California",
    website: "https://www.tooltribe.com/",
    category: "SaaS"
  },
  {
    id: "ts-019",
    name: "Tempesta Media",
    cohort: "Spring 2024 Americas",
    tags: ["Marketing", "Content"],
    description: "Predictively drive leads, revenue and ROI from content marketing",
    location: "Indiana",
    website: "https://www.tempestamedia.com",
    category: "Marketing"
  },
  {
    id: "ts-020",
    name: "OutboundSync",
    cohort: "Spring 2024 Americas",
    tags: ["Sales", "CRM"],
    description: "Integrates outbound sales and marketing tools with CRM",
    location: "Colorado",
    website: "https://outboundsync.com/",
    category: "Sales"
  },

  // Spring 2024 EMEA - From WebFetch
  {
    id: "ts-021",
    name: "Avo",
    cohort: "Spring 2024 EMEA",
    tags: ["Developer Tools", "No-Code"],
    description: "Helps developers build apps 10x faster, using configuration instead of traditional methods",
    location: "Romania",
    website: "https://avohq.io",
    category: "Developer Tools"
  },
  {
    id: "ts-022",
    name: "Growform",
    cohort: "Spring 2024 EMEA",
    tags: ["Marketing", "Forms"],
    description: "Helps lead generation agencies and marketers build forms that capture up to 2x as many, better qualified leads",
    location: "UK",
    website: "https://www.growform.co",
    category: "Marketing"
  },
  {
    id: "ts-023",
    name: "Jasara Technology",
    cohort: "Spring 2024 EMEA",
    tags: ["SaaS", "Inventory"],
    description: "Building PrepBusiness, an inventory management software for 3PLs that specialize in Amazon sellers",
    location: "Jordan",
    website: "https://jasaratech.com",
    category: "SaaS"
  },
  {
    id: "ts-024",
    name: "Linklo",
    cohort: "Spring 2024 EMEA",
    tags: ["Marketing", "LinkedIn"],
    description: "Helps Linkedin advertisers optimize ad campaigns and maximize ROI",
    location: "UK",
    website: "https://linklo.io",
    category: "Marketing"
  },
  {
    id: "ts-025",
    name: "Marcode",
    cohort: "Spring 2024 EMEA",
    tags: ["Marketing", "Monitoring"],
    description: "Monitors ads running in search engines for a company's brand keywords",
    location: "UK",
    website: "https://marcode.ai",
    category: "Marketing"
  },

  // Fall 2023 - Sample from WebFetch
  {
    id: "ts-026",
    name: "Wrenly",
    cohort: "Fall 2023",
    tags: ["HR", "AI", "Feedback"],
    description: "AI-powered ally in Slack/Teams for gathering team feedback and insights",
    location: "New Jersey, Texas",
    website: "https://wrenly.ai/",
    category: "HR"
  },
  {
    id: "ts-027", 
    name: "UpSheets",
    cohort: "Fall 2023",
    tags: ["Bookkeeping", "Xero"],
    description: "Web-based app enabling data upload into Xero Payroll and Projects",
    location: "New Zealand",
    website: "https://upsheets.com/",
    category: "Bookkeeping"
  },
  {
    id: "ts-028",
    name: "TrainerMetrics",
    cohort: "Fall 2023",
    tags: ["Fitness", "Training"],
    description: "Enables personal training at scale through service delivery automation",
    location: "California, Washington",
    website: "https://trainermetrics.com/",
    category: "Fitness"
  },

  // Spring 2023 - Sample from WebFetch
  {
    id: "ts-029",
    name: "TxtSquad",
    cohort: "Spring 2023",
    tags: ["SaaS", "SMS"],
    description: "Team-based system for organizations to drive, engage and deepen connection over text message",
    location: "Canada", 
    website: "https://txtsquad.com",
    category: "SaaS"
  },
  {
    id: "ts-030",
    name: "Legal27",
    cohort: "Spring 2023",
    tags: ["Legal", "Assistants"],
    description: "Provides lawyers remote legal assistants and software to improve productivity",
    location: "Chile",
    website: "https://legal27.com/us",
    category: "Legal"
  }

  // TODO: Continue adding companies from remaining cohorts (Fall 2022, Spring 2022, Fall 2021, etc.)
  // Current count: ~30 companies, need ~168 more to reach 198 total
];

// Add standard fields to all companies
const enrichedCompanies = allTinySeedCompanies.map(company => ({
  ...company,
  crunchbaseLink: company.crunchbaseLink || `https://www.crunchbase.com/organization/${company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
  googleSearchLink: company.googleSearchLink || `https://www.google.com/search?q=site:startupsfortherestofus.com+"${company.name.replace(/"/g, '\\"')}"`,
  tags: company.tags || []
}));

function main() {
  console.log('🚀 Compiling complete TinySeed portfolio...');
  console.log(`📊 Currently have ${enrichedCompanies.length} companies`);
  console.log(`🎯 Target: ~198 total companies`);
  console.log(`📝 Still need: ~${198 - enrichedCompanies.length} companies`);
  
  // Analyze current data
  const cohorts = [...new Set(enrichedCompanies.map(c => c.cohort))];
  const categories = [...new Set(enrichedCompanies.map(c => c.category))];
  
  console.log(`\n📋 Cohorts (${cohorts.length}): ${cohorts.join(', ')}`);
  console.log(`🏷️  Categories (${categories.length}): ${categories.join(', ')}`);
  
  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedCompanies, null, 2));
  console.log(`\n💾 Saved ${enrichedCompanies.length} companies to ${OUTPUT_FILE}`);
  
  console.log('\n✅ Progress:');
  console.log(`• Removed incorrect companies like Raycast`);
  console.log(`• Added real TinySeed portfolio companies`);
  console.log(`• Structured data with proper cohorts and categories`);
  console.log(`• Need to continue adding remaining ~${198 - enrichedCompanies.length} companies`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { allTinySeedCompanies };