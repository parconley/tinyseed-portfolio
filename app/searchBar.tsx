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
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  categories = [],
  cohorts = [],
  locations = [],
  placeholder = "Search project descriptions..."
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

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

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else if (value !== undefined) {
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
      <div className="flex gap-2">
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
          onClick={() => {
            const newFilters = { ...filters, showPodcastOnly: !filters.showPodcastOnly };
            setFilters(newFilters);
            onSearch(query, newFilters);
          }}
          variant="outline"
          className={`px-4 flex items-center gap-2 transition-colors ${
            filters.showPodcastOnly 
              ? 'bg-[#D4A13C] hover:bg-[#B8912A] border-[#D4A13C] text-white hover:text-white' 
              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
          }`}
          disabled={isLoading}
          title="Show only companies with podcast content"
        >
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">Podcasts Only</span>
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category
                </label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Acquired">Acquired</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cohort Filter */}
            {cohorts.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Cohort
                </label>
                <Select
                  value={filters.cohort || 'all'}
                  onValueChange={(value) => updateFilter('cohort', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All cohorts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All cohorts</SelectItem>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort} value={cohort}>
                        {cohort}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Location Filter */}
            {locations.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Location
                </label>
                <Select
                  value={filters.location || 'all'}
                  onValueChange={(value) => updateFilter('location', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-xs text-gray-600">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                >
                  {key}: {value}
                  <button
                    onClick={() => updateFilter(key as keyof SearchFilters, undefined)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}