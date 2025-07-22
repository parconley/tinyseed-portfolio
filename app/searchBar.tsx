'use client';

import React, { useState, useCallback } from 'react';
import { Search, X, Mic } from 'lucide-react';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './components/ui/select';
import { SearchFilters } from './types';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  isLoading?: boolean;
  categories?: string[];
  cohorts?: string[];
  locations?: string[];
  placeholder?: string;
  searchQuery?: string;
  currentFilters?: SearchFilters;
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  categories = [],
  cohorts = [],
  locations = [],
  placeholder = "Search project descriptions...",
  searchQuery = '',
  currentFilters = {}
}: SearchBarProps) {
  const [query, setQuery] = useState(searchQuery);

  // Update query when searchQuery prop changes (from suggestions)
  React.useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);
  
  // Update filters when currentFilters prop changes
  React.useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleSearch = useCallback(() => {
    onSearch(query, filters);
  }, [query, filters, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    onSearch('', {});
  };

  const clearFilters = () => {
    setFilters({});
    onSearch(query, {});
  };

  const updateFilter = (key: keyof SearchFilters, value: string | boolean | undefined) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const hasActiveSearch = query.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          {(hasActiveSearch || hasActiveFilters) && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
        
        <Button
          onClick={() => updateFilter('showPodcastOnly', filters.showPodcastOnly ? undefined : true)}
          variant="outline"
          disabled={isLoading}
          className={`px-4 border border-gray-300 ${filters.showPodcastOnly 
            ? 'bg-[#D4A13C] text-white border-[#D4A13C]' 
            : 'text-black bg-white border-white'
          }`}
        >
          <Mic className="h-4 w-4 mr-2" />
          Podcast Only
        </Button>
      </div>
    </div>
  );
}