const fs = require('fs');

// Read the company data
const companiesData = JSON.parse(fs.readFileSync('./app/data/tinyseed-companies-with-embeddings.json', 'utf8'));

// Process all companies and add podcast links for everyone
function processAllCompanies() {
  console.log(`Adding podcast links for all ${companiesData.length} companies...`);
  
  const updatedCompanies = companiesData.map(company => {
    // Add podcast fields for EVERY company
    return {
      ...company,
      hasStartupsForRestOfUsContent: true, // Every company gets a podcast link
      startupsForRestOfUsSearchLink: `https://www.startupsfortherestofus.com/?s=${encodeURIComponent(company.name)}`
    };
  });
  
  // Write updated data back to file
  console.log('Saving updated data...');
  fs.writeFileSync('./app/data/tinyseed-companies-with-embeddings.json', JSON.stringify(updatedCompanies, null, 2));
  
  console.log('✅ Successfully added podcast links to all companies!');
  console.log(`📊 Total companies with podcast links: ${updatedCompanies.length}`);
  
  // Show a few examples
  console.log('\n📝 Examples of generated links:');
  updatedCompanies.slice(0, 5).forEach((company, index) => {
    console.log(`${index + 1}. ${company.name}: ${company.startupsForRestOfUsSearchLink}`);
  });
  
  console.log('\n🎉 All done! Every company now has a podcast search link.');
}

// Run the script
processAllCompanies();