import Link from "next/link"
import SearchBar from './searchBar'
import { SearchFilters } from './types'

interface TopHeaderProps {
  scrollToAbout?: () => void;
  onSearch?: (query: string, filters: SearchFilters) => void;
  isLoading?: boolean;
  categories?: string[];
  cohorts?: string[];
  locations?: string[];
  searchQuery?: string;
  currentFilters?: SearchFilters;
}

export default function TopHeader({ 
  scrollToAbout, 
  onSearch, 
  isLoading = false, 
  categories = [], 
  cohorts = [], 
  locations = [],
  searchQuery = '',
  currentFilters = {}
}: TopHeaderProps) {
  const suggestions = [
    "Real Estate",
    "AI",
    "E-commerce",
    "Sales",
    "Human Resources",
    "Video",
    "Marketing",
    "Transportation",
    "Legal",
    "Service Businesses",
    "Email",
    "Payments",
    "Biotech",
    "Consumer",
    "CRM",
    "No Code"
  ];

  return (
    <div className="bg-slate-800 rounded-lg p-6 text-white mb-4">
      <h1 className="text-base font-bold text-white mb-4 text-left">
        Intelligent search over every TinySeed portfolio company
      </h1>
      
      <p className="text-sm text-gray-300 mb-4 text-left">
        This is an unofficial website for the{' '}
        <a href="https://tinyseed.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#D4A13C' }}>
          TinySeed
        </a>{' '}
        portfolio. TinySeed is founded by{' '}
        <a href="https://robwalling.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#D4A13C' }}>
          Rob Walling
        </a>{' '}
        and Einar Vollset. It&apos;s the first accelerator designed specifically for bootstrappers, investing $120k-$240k in early-stage SaaS companies.
      </p>
      
      <p className="text-sm text-gray-300 mb-4 text-left">
        Unlike typical VC-backed startups, TinySeed companies are real case studies in bootstrapping—profitable, sustainable businesses 
        built without venture capital&apos;s "growth at all costs" mentality. Perfect for studying how to actually build and grow a business.
      </p>
      
      <p className="text-sm text-gray-300 mb-4 text-left">
        Search through all their portfolio companies using hybrid AI-powered search. It combines semantic understanding with precise keyword matching 
        to find exactly what you&apos;re looking for while handling synonyms and variations automatically.
      </p>

      <p className="text-sm text-gray-300 mb-6 text-left">
        Each company includes Crunchbase links and, where available, links to their appearances on the{' '}
        <a href="https://www.startupsfortherestofus.com/" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#D4A13C' }}>
          Startups for the Rest of Us
        </a>{' '}
        podcast.
      </p>

      {/* Search Bar */}
      {onSearch && (
        <div className="mb-6">
          <SearchBar
            onSearch={onSearch}
            isLoading={isLoading}
            categories={categories}
            cohorts={cohorts}
            locations={locations}
            placeholder="Search project descriptions..."
            searchQuery={searchQuery}
            currentFilters={currentFilters}
          />
        </div>
      )}
      
      <p className="text-sm text-gray-400 mb-4 text-left">
        Here are a few starting suggestions:
      </p>
      
      <div className="flex flex-wrap gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSearch?.(suggestion, currentFilters)}
            className="px-4 py-2 rounded-full text-sm cursor-pointer transition-colors hover:opacity-80"
            style={{ backgroundColor: '#D4A13C', color: 'white' }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}