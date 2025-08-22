import { useState, useMemo } from 'react';

export function useSearch(data, searchKeys) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return data.filter(item =>
      searchKeys.some(key =>
        String(item[key]).toLowerCase().includes(lowercasedSearchTerm)
      )
    );
  }, [data, searchTerm, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
}