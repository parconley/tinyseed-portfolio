'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Building } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import { Button } from './components/ui/button';
import { Company, SortKey, SortOrder, TableColumn } from './types';

interface CompaniesTableProps {
  companies: Company[];
  onSort: (key: SortKey, order: SortOrder) => void;
  sortKey: SortKey;
  sortOrder: SortOrder;
  isLoading?: boolean;
}

const tableColumns: TableColumn[] = [
  { key: 'name', label: 'Company', sortable: true, width: 'w-48' },
  { key: 'cohort', label: 'Cohort', sortable: true, width: 'w-32' },
  { key: 'location', label: 'Location', sortable: true, width: 'w-32' },
  { key: 'description', label: 'Description', sortable: false, width: '' },
];

export default function CompaniesTable({
  companies,
  onSort,
  sortKey,
  sortOrder,
  isLoading = false
}: CompaniesTableProps) {
  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      // Toggle order if same key
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for similarity, asc for others
      onSort(key, key === 'similarity' ? 'desc' : 'asc');
    }
  };

  const formatSimilarity = (similarity?: number): string => {
    if (similarity === undefined) return '';
    return `${(similarity * 100).toFixed(1)}%`;
  };

  const getFaviconUrl = (website: string): string => {
    try {
      const url = new URL(website);
      // Try multiple favicon services
      return `https://icon.horse/icon/${url.hostname}`;
    } catch {
      return '';
    }
  };


  const getSortIcon = (columnKey: SortKey) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 text-sm mb-2">No companies found</div>
        <div className="text-gray-400 text-sm">
          Try adjusting your search criteria or filters
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map((column) => (
              <TableHead 
                key={column.key} 
                className={`${column.width || ''} ${column.sortable ? 'cursor-pointer select-none hover:bg-gray-50' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow 
              key={company.id}
              className="hover:bg-gray-50 transition-colors"
            >
                <TableCell className="font-medium">
                  <div className="inline-flex items-center gap-2 group">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 transition-opacity hover:opacity-80"
                        title={`Visit ${company.name} website`}
                        onMouseDown={(e) => {
                          // Allow middle-click to work properly
                          if (e.button === 1) {
                            e.preventDefault();
                            window.open(company.website, '_blank');
                          }
                        }}
                      >
                        <img 
                          src={getFaviconUrl(company.website)} 
                          alt={`${company.name} favicon`}
                          className="w-4 h-4 rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const url = new URL(company.website);
                            
                            // Try multiple fallback options
                            if (target.src.includes('icon.horse')) {
                              target.src = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
                            } else if (target.src.includes('google.com/s2/favicons')) {
                              target.src = `${url.origin}/favicon.ico`;
                            } else if (target.src.includes('favicon.ico')) {
                              target.src = `https://favicongrabber.com/api/grab/${url.hostname}`;
                            } else {
                              target.style.display = 'none';
                            }
                          }}
                        />
                      </a>
                    )}
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-left cursor-pointer transition-colors duration-200 ease-out hover:text-[#D4A13C] group-hover:text-[#D4A13C] inline-block"
                        title={`Visit ${company.name} website`}
                      >
                        {company.name}
                      </a>
                    ) : (
                      <span>{company.name}</span>
                    )}
                  </div>
                </TableCell>
              
              <TableCell className="text-sm">{company.cohort}</TableCell>
              
              <TableCell className="text-sm">{company.location}</TableCell>
              
              <TableCell>
                <div className="text-sm text-gray-600">
                  {company.description}
                </div>
              </TableCell>
              
              
              <TableCell>
                <div className="flex gap-1">
                  <button
                    className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      window.open(company.crunchbaseLink, '_blank');
                    }}
                    onMouseDown={(e) => {
                      if (e.button === 1) {
                        e.preventDefault();
                        window.open(company.crunchbaseLink, '_blank');
                      }
                    }}
                    title={`View ${company.name} on Crunchbase`}
                  >
                    <Building 
                      className="h-4 w-4 text-gray-600 transition-colors duration-200 ease-out hover:text-[#D4A13C]" 
                    />
                  </button>
                  {company.hasStartupsForRestOfUsContent && company.startupsForRestOfUsSearchLink && (
                    <button
                      className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        if (company.startupsForRestOfUsSearchLink) {
                          window.open(company.startupsForRestOfUsSearchLink, '_blank');
                        }
                      }}
                      onMouseDown={(e) => {
                        if (e.button === 1 && company.startupsForRestOfUsSearchLink) {
                          e.preventDefault();
                          window.open(company.startupsForRestOfUsSearchLink, '_blank');
                        }
                      }}
                      title={`Search for ${company.name} on Startups for the Rest of Us podcast`}
                    >
                      <span 
                        className="material-icons text-gray-500 transition-colors duration-200 ease-out hover:text-[#D4A13C]"
                        style={{ 
                          fontSize: '16px'
                        }}
                      >
                        mic
                      </span>
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}