#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the companies data
const companiesFile = path.join(__dirname, '../app/data/tinyseed-companies.json');
const companies = JSON.parse(fs.readFileSync(companiesFile, 'utf8'));

async function generateEmbedding(text) {
  try {
    const response = await fetch('http://localhost:3000/api/similarity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

async function processCompanies() {
  console.log(`Processing ${companies.length} companies...`);
  
  const companiesWithEmbeddings = [];
  
  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    console.log(`Processing ${i + 1}/${companies.length}: ${company.name}`);
    
    // Create searchable text from company data
    const searchableText = [
      company.name,
      company.description,
      company.category,
      company.subcategory || '',
      ...(company.tags || []),
      ...(company.founders || [])
    ].filter(Boolean).join(' ');
    
    // Generate embedding
    const embedding = await generateEmbedding(searchableText);
    
    // Add embedding to company data
    companiesWithEmbeddings.push({
      ...company,
      embedding
    });
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Save the results
  const outputFile = path.join(__dirname, '../app/data/tinyseed-companies-with-embeddings.json');
  fs.writeFileSync(outputFile, JSON.stringify(companiesWithEmbeddings, null, 2));
  
  console.log(`✅ Generated embeddings for ${companiesWithEmbeddings.length} companies`);
  console.log(`📁 Saved to: ${outputFile}`);
  
  // Verify embeddings were generated
  const withEmbeddings = companiesWithEmbeddings.filter(c => c.embedding && c.embedding.length > 0);
  console.log(`🎯 ${withEmbeddings.length}/${companiesWithEmbeddings.length} companies have embeddings`);
}

// Check if server is running
fetch('http://localhost:3000/api/similarity')
  .then(() => {
    console.log('✅ API server detected, starting embedding generation...');
    processCompanies();
  })
  .catch(() => {
    console.error('❌ Please start the development server first: npm run dev');
    process.exit(1);
  });