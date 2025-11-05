import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { slideUp } from '../utils/constants';

const SearchBar = ({ variant = 'desktop' }) => {
  const { updateFilters, filters } = useNotes();
  const [searchValue, setSearchValue] = useState(filters.search || '');

  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    updateFilters({ search: value });
  };

  const clearSearch = () => {
    setSearchValue('');
    updateFilters({ search: '' });
  };

  const isMobile = variant === 'mobile';

  return (
    <motion.div
      variants={isMobile ? slideUp : {}}
      initial="hidden"
      animate="visible"
      className={`relative ${isMobile ? 'w-full' : 'max-w-2xl mx-4 hidden md:block'}`}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchValue}
        onChange={handleSearch}
        className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 dark:focus:border-blue-400 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
      />
      {searchValue && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </motion.div>
  );
};

export default SearchBar;