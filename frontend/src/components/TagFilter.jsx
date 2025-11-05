import { motion } from 'framer-motion';
import { Tag, X } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { staggerContainer, staggerItem } from '../utils/constants';

const TagFilter = () => {
  const { tags, filters, updateFilters } = useNotes();

  const handleTagClick = (tag) => {
    updateFilters({ tags: filters.tags === tag ? '' : tag });
  };

  const clearTagFilter = () => {
    updateFilters({ tags: '' });
  };

  if (tags.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2 items-center"
    >
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Tag className="w-4 h-4" />
        <span>Filter by tag:</span>
      </div>
      
      {tags.map((tag, index) => (
        <motion.button
          key={index}
          variants={staggerItem}
          onClick={() => handleTagClick(tag)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            filters.tags === tag
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          #{tag}
        </motion.button>
      ))}
      
      {filters.tags && (
        <motion.button
          variants={staggerItem}
          onClick={clearTagFilter}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default TagFilter;