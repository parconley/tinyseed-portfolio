'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from './searchBar';
import CompaniesTable from './companiesTable';
import { Company, SearchFilters, SortKey, SortOrder } from './types';
import { cosineSimilarity } from './utils/cosSim';
import { getSortedData, getFilteredData, getUniqueValues } from './utils/getSortedData';

interface ContainerProps {
  companies: Company[];
  title?: string;
  subtitle?: string;
  searchQuery?: string;
  searchFilters?: SearchFilters;
  hideSearchBar?: boolean;
}


export default function Container({ 
  companies, 
  title = "TinySeed Portfolio Search",
  subtitle = "Discover and explore our portfolio companies using semantic search",
  searchQuery = "",
  searchFilters = {},
  hideSearchBar = false
}: ContainerProps) {
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(companies);
  const [isLoading, setIsLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('similarity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [error, setError] = useState<string | null>(null);

  // Extract unique values for filters
  const filterOptions = useMemo(() => ({
    categories: getUniqueValues(companies, 'category'),
    cohorts: getUniqueValues(companies, 'cohort'),
    locations: getUniqueValues(companies, 'location'),
  }), [companies]);

  // Generate embeddings for search query
  const generateEmbedding = async (text: string): Promise<number[] | null> => {
    try {
      // Ensure we have text to process
      if (!text || text.trim().length === 0) {
        return null;
      }

      const response = await fetch('/api/similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error('Invalid embedding response format');
      }
      
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate embedding');
      return null;
    }
  };

  // Handle search with semantic similarity
  const handleSearch = useCallback(async (query: string, filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let searchResults = [...companies];

      // Ensure companies have required fields
      searchResults = searchResults.map(company => ({
        ...company,
        tags: company.tags || [],
        description: company.description || '',
        category: company.category || '',
        name: company.name || ''
      }));

      // If there's a search query, perform hybrid search (text + semantic)
      if (query.trim()) {
        const queryEmbedding = await generateEmbedding(query);
        const lowercaseQuery = query.toLowerCase();
        
        // Calculate similarities for all companies using hybrid approach
        searchResults = searchResults.map(company => {
          const companyText = company.description || '';
          
          const lowercaseText = companyText.toLowerCase();
          
          // 1. Exact text matching (ctrl+f style)
          let textScore = 0;
          if (lowercaseText.includes(lowercaseQuery)) {
            textScore = 1.0; // Perfect match for exact substring
          } else {
            // Check for partial word matches
            const queryWords = lowercaseQuery.split(' ').filter(w => w.length > 0);
            const textWords = lowercaseText.split(' ').filter(w => w.length > 0);
            const matchingWords = queryWords.filter(word => 
              textWords.some(textWord => textWord.includes(word) || word.includes(textWord))
            );
            textScore = queryWords.length > 0 ? (matchingWords.length / queryWords.length) : 0;
          }
          
          // 2. Semantic similarity
          let semanticScore = 0;
          if (queryEmbedding && company.embedding && company.embedding.length > 0) {
            semanticScore = cosineSimilarity(queryEmbedding, company.embedding);
          }
          
          // 3. Hybrid scoring: prioritize exact matches, boost with semantic similarity
          let finalScore;
          if (textScore >= 0.8) {
            // High text match - use text score with semantic boost
            finalScore = Math.min(1.0, textScore + (semanticScore * 0.2));
          } else if (textScore > 0) {
            // Some text match - blend text and semantic
            finalScore = (textScore * 0.7) + (semanticScore * 0.3);
          } else {
            // No text match - rely on semantic similarity only
            finalScore = semanticScore * 0.8; // Slight penalty for no text match
          }
          
          return { ...company, similarity: finalScore };
        });

        // Define generic terms that require explicit matching rather than semantic similarity
        const genericTerms = [
          'real estate', 'ai', 'saas', 'fintech', 'finance', 'marketing', 'sales', 
          'analytics', 'data', 'software', 'platform', 'app', 'tool', 'service',
          'business', 'startup', 'tech', 'crm', 'hr', 'automation', 'api'
        ];
        
        const isGenericQuery = genericTerms.some(term => 
          lowercaseQuery.includes(term) || term.includes(lowercaseQuery)
        );
        
        // MUCH stricter approach: require both semantic similarity AND keyword matching
        const semanticResults = searchResults.filter(company => {
          if (!company.similarity || company.similarity < 0.4) return false;
          
          // For ANY query, require at least partial keyword matching
          const companyText = (company.description || '').toLowerCase();
          
          // Handle synonyms and variations
          const synonymMap = {
            'e-commerce': ['ecommerce', 'e-commerce', 'commerce', 'online store', 'retail'],
            'ecommerce': ['ecommerce', 'e-commerce', 'commerce', 'online store', 'retail'],
            'podcasting': ['podcast', 'podcasting', 'podcasts', 'audio'],
            'podcast': ['podcast', 'podcasting', 'podcasts', 'audio'],
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
            'artificial intelligence': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
            'hr': ['hr', 'human resources', 'personnel', 'workforce'],
            'human resources': ['hr', 'human resources', 'personnel', 'workforce'],
            'real estate': ['real estate', 'property management', 'construction', 'residential', 'commercial real estate', 'proptech'],
            'transportation': ['transportation', 'vehicles', 'ev', 'electric vehicle', 'automotive', 'fleet']
          };
          
          const queryWords = lowercaseQuery.split(' ').filter(w => w.length >= 3);
          
          // Check for keyword matches including synonyms
          const hasKeywordMatch = queryWords.some(word => {
            // Direct word match
            if (companyText.includes(word)) return true;
            
            // Check synonyms
            const synonyms = synonymMap[word] || synonymMap[lowercaseQuery];
            if (synonyms) {
              return synonyms.some(synonym => companyText.includes(synonym));
            }
            
            return false;
          });
          
          // Exclude specific companies that shouldn't appear in certain searches
          if (lowercaseQuery.includes('real estate')) {
            const excludeFromRealEstate = ['cobalt intelligence', 'segmetrics'];
            if (excludeFromRealEstate.includes(company.name.toLowerCase())) {
              return false;
            }
          }
          
          return hasKeywordMatch;
        });
        
        // Only minimal fallback - exact phrase matches for very specific queries
        const fallbackResults = searchResults
          .filter(company => !semanticResults.find(sr => sr.id === company.id)) // Not already in semantic results
          .filter(company => {
            const companyText = (company.description || '').toLowerCase();
            
            // Only allow exact phrase matches as fallback
            return companyText.includes(lowercaseQuery);
          });
        
        // Combine semantic results with fallback word matches, removing duplicates
        const combinedResults = [...semanticResults];
        fallbackResults.forEach(fallback => {
          if (!combinedResults.find(existing => existing.id === fallback.id)) {
            combinedResults.push(fallback);
          }
        });
        
        searchResults = combinedResults;
        
        setSortKey('similarity');
        setSortOrder('desc');
      } else {
        // No search query, remove similarity scores
        searchResults = searchResults.map(company => {
          const { similarity, ...rest } = company;
          return rest;
        });
        
        if (sortKey === 'similarity') {
          setSortKey('name');
          setSortOrder('asc');
        }
      }

      // Apply filters
      const filtered = getFilteredData(searchResults, {
        category: filters.category,
        cohort: filters.cohort,
        location: filters.location,
        showPodcastOnly: filters.showPodcastOnly,
      });

      setFilteredCompanies(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      setFilteredCompanies(companies);
    } finally {
      setIsLoading(false);
    }
  }, [companies, sortKey]);

  // Handle sorting
  const handleSort = useCallback((key: SortKey, order: SortOrder) => {
    setSortKey(key);
    setSortOrder(order);
  }, []);

  // Apply sorting when sort parameters change
  const sortedCompanies = useMemo(() => {
    return getSortedData(filteredCompanies, sortKey, sortOrder);
  }, [filteredCompanies, sortKey, sortOrder]);

  // Initialize with all companies
  useEffect(() => {
    setFilteredCompanies(companies);
  }, [companies]);


  // Handle external search changes
  useEffect(() => {
    if (searchQuery || Object.keys(searchFilters).length > 0) {
      handleSearch(searchQuery, searchFilters);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, searchFilters, companies]);

  return (
    <div>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-left mb-4">
          <h1 className="text-base font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
      )}

      {/* Search Bar */}
      {!hideSearchBar && (
        <div className="mb-4">
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            categories={filterOptions.categories}
            cohorts={filterOptions.cohorts}
            locations={filterOptions.locations}
            searchQuery={searchQuery}
            currentFilters={searchFilters}
          />
        </div>
      )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Search Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border">

        <CompaniesTable
          companies={sortedCompanies}
          onSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}