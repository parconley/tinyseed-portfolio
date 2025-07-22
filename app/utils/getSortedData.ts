import { Company, SortKey, SortOrder } from '../types';

/**
 * Sorts an array of companies based on the specified key and order
 * @param companies Array of companies to sort
 * @param sortKey Key to sort by
 * @param sortOrder Order to sort (asc or desc)
 * @returns Sorted array of companies
 */
export function getSortedData(
  companies: Company[], 
  sortKey: SortKey, 
  sortOrder: SortOrder = 'desc'
): Company[] {
  return [...companies].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Company];
    let bValue: any = b[sortKey as keyof Company];

    // Handle special cases
    if (sortKey === 'similarity') {
      aValue = a.similarity ?? 0;
      bValue = b.similarity ?? 0;
    }

    // Handle undefined/null values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
    if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

    // Handle string comparisons
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    // Handle number comparisons
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle array comparisons (for tags, founders)
    if (Array.isArray(aValue) && Array.isArray(bValue)) {
      const aStr = aValue.join(', ').toLowerCase();
      const bStr = bValue.join(', ').toLowerCase();
      const comparison = aStr.localeCompare(bStr);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    // Fallback to string comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr);
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Filters companies based on search criteria
 * @param companies Array of companies to filter
 * @param filters Filter criteria
 * @returns Filtered array of companies
 */
export function getFilteredData(
  companies: Company[], 
  filters: {
    category?: string;
    cohort?: string;
    location?: string;
    searchTerm?: string;
    showPodcastOnly?: boolean;
  }
): Company[] {
  return companies.filter(company => {
    // Category filter
    if (filters.category && company.category !== filters.category) {
      return false;
    }

    // Cohort filter
    if (filters.cohort && company.cohort !== filters.cohort) {
      return false;
    }

    // Location filter (partial match)
    if (filters.location && !company.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Search term filter (searches name, description, and tags)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const searchFields = [
        company.name,
        company.description,
        ...company.tags,
        company.category,
        company.location
      ].map(field => field.toLowerCase());

      if (!searchFields.some(field => field.includes(searchTerm))) {
        return false;
      }
    }

    // Podcast filter - only show companies with podcast content
    if (filters.showPodcastOnly && !company.hasStartupsForRestOfUsContent) {
      return false;
    }

    return true;
  });
}

/**
 * Gets unique values for a specific field across all companies
 * @param companies Array of companies
 * @param field Field to extract unique values from
 * @returns Array of unique values
 */
export function getUniqueValues(companies: Company[], field: keyof Company): string[] {
  const values = companies
    .map(company => company[field])
    .filter(Boolean)
    .flatMap(value => Array.isArray(value) ? value : [value])
    .map(value => String(value));
  
  return Array.from(new Set(values)).sort();
}

/**
 * Groups companies by a specific field
 * @param companies Array of companies
 * @param field Field to group by
 * @returns Object with grouped companies
 */
export function groupCompaniesByField(
  companies: Company[], 
  field: keyof Company
): Record<string, Company[]> {
  return companies.reduce((groups, company) => {
    const value = String(company[field] || 'Unknown');
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(company);
    return groups;
  }, {} as Record<string, Company[]>);
}