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

      // If there's a search query, perform semantic search
      if (query.trim()) {
        const queryEmbedding = await generateEmbedding(query);
        
        // Calculate similarities for all companies
        searchResults = searchResults.map(company => {
          if (queryEmbedding && company.embedding && company.embedding.length > 0) {
            // Use semantic similarity for companies with embeddings
            const similarity = cosineSimilarity(queryEmbedding, company.embedding);
            return { ...company, similarity };
          } else {
            // Fallback to text-based similarity
            const companyText = [
              company.name,
              company.description,
              company.category,
              ...(company.tags || [])
            ].filter(Boolean).join(' ');
            
            const lowercaseQuery = query.toLowerCase();
            const lowercaseText = companyText.toLowerCase();
            let textSimilarity = 0;
            
            if (lowercaseText.includes(lowercaseQuery)) {
              textSimilarity = 0.8; // High similarity for exact matches
            } else {
              // Check for partial word matches
              const queryWords = lowercaseQuery.split(' ').filter(w => w.length > 0);
              const textWords = lowercaseText.split(' ').filter(w => w.length > 0);
              const matchingWords = queryWords.filter(word => 
                textWords.some(textWord => textWord.includes(word) || word.includes(textWord))
              );
              textSimilarity = queryWords.length > 0 ? (matchingWords.length / queryWords.length * 0.6) : 0;
            }
            
            return { ...company, similarity: textSimilarity };
          }
        });

        // Filter out very low similarity results
        searchResults = searchResults.filter(company => 
          company.similarity !== undefined && company.similarity > 0.1
        );
        
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