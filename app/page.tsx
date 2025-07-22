'use client';

import Link from "next/link"
import Container from "./container"
import TopHeader from "./topHeader"
import companiesData from "./data/tinyseed-companies-with-embeddings.json"
import { Company, SearchFilters } from "./types"
import { useRef, useState, useMemo } from "react"
import { getUniqueValues } from "./utils/getSortedData"

// Type assertion for the imported data
const companies = companiesData as Company[]

export default function Page() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  
  // Extract unique values for filters
  const filterOptions = useMemo(() => ({
    categories: getUniqueValues(companies, 'category'),
    cohorts: getUniqueValues(companies, 'cohort'),
    locations: getUniqueValues(companies, 'location'),
  }), []);
  
  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900">🌱 TinySeed Portfolio</h1>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={scrollToAbout}
              className="text-base text-gray-600 hover:text-gray-900 transition-colors"
            >
              about
            </button>
            <Link 
              className="text-base text-gray-600 hover:text-gray-900 transition-colors" 
              href="https://github.com/yourusername/tinyseed-portfolio"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
            </Link>
            <Link 
              className="text-base text-gray-600 hover:text-gray-900 transition-colors" 
              href="https://github.com/parconley/tinyseed-portfolio/blob/main/tinyseed-portfolio/tinyseed_portfolio_companies_extracted.csv"
              target="_blank"
              rel="noopener noreferrer"
            >
              data
            </Link>
          </div>
        </div>

        {/* Header Section */}
        <TopHeader 
          scrollToAbout={scrollToAbout}
          onSearch={handleSearch}
          categories={filterOptions.categories}
          cohorts={filterOptions.cohorts}
          locations={filterOptions.locations}
        />

        {/* Search Section */}
        <Container 
          companies={companies}
          title=""
          subtitle=""
          searchQuery={searchQuery}
          searchFilters={searchFilters}
          hideSearchBar={true}
        />

        {/* About Section */}
        <section ref={aboutRef} id="about" className="bg-gray-50 px-4 py-4 rounded-lg mt-6">
          <p className="text-sm text-gray-600 mb-4">
            Learn more about TinySeed at{' '}
            <Link href="https://tinyseed.com" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              tinyseed.com
            </Link>
            .
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Unofficial project by{' '}
            <Link href="https://parconley.com" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              Parker Conley
            </Link>
            . Claude Code helped me build this, using{' '}
            <Link href="https://nabeelqu.co/" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              Nabeel S. Qureshi
            </Link>&apos;s{' '}
            <Link href="https://www.evwinners.org/" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              EV Winners
            </Link>{' '}
            and{' '}
            <Link href="https://thesephist.com/" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              Linus Lee
            </Link>&apos;s{' '}
            <Link href="https://ycvibecheck.com/" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              YC Vibe Check
            </Link>{' '}
            repos as heavy inspiration.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Data sourced from{' '}
            <Link href="https://tinyseed.com/portfolio" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              TinySeed&apos;s portfolio
            </Link>{' '}
            page, which I wanted to be more searchable. Specifically, I wanted to know which TinySeed companies had{' '}
            <Link href="https://www.startupsfortherestofus.com/" className="underline hover:opacity-80" style={{ color: '#D4A13C' }} target="_blank">
              Startups for the Rest of Us
            </Link>{' '}
            episodes (note: the podcast link detection isn&apos;t 100% accurate).
          </p>
          <p className="text-sm text-gray-600">
            Last updated July 21st, 2025 with up to the 2025 Spring Cohort.
          </p>
        </section>
      </div>

    </div>
  )
}