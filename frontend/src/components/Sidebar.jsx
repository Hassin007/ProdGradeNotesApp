import { motion } from 'framer-motion';
import { Home, Archive, Tag, Filter, X, ChevronLeft } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { slideUp, staggerContainer, staggerItem } from '../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const { tags, filters, updateFilters, clearFilters } = useNotes();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/', icon: Home, label: 'All Notes', filter: { isArchived: false } },
    { path: '/archive', icon: Archive, label: 'Archive', filter: { isArchived: true } },
  ];

  const handleNavigation = (path, filter = {}) => {
    updateFilters(filter);
    navigate(path);
    // Don't close sidebar on desktop when navigating
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleTagFilter = (tag) => {
    updateFilters({ tags: tag });
    navigate('/');
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const clearTagFilter = () => {
    updateFilters({ tags: '' });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -300,
          width: isOpen ? 256 : 0
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed lg:relative inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg lg:shadow-none overflow-hidden"
        style={{ width: isOpen ? '256px' : '0px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-w-[256px]">
          {isOpen && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
              <div className="flex items-center gap-2">
                {/* Desktop toggle button */}
                <button
                  onClick={onClose}
                  className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                {/* Mobile close button */}
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation - Only show when sidebar is open */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto min-w-[256px]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-4 space-y-2"
            >
              {menuItems.map((item) => (
                <motion.button
                  key={item.path}
                  variants={staggerItem}
                  onClick={() => handleNavigation(item.path, item.filter)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</span>
                  {filters.tags && (
                    <button
                      onClick={clearTagFilter}
                      className="ml-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagFilter(tag)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                        filters.tags === tag
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer - Only show when sidebar is open */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 min-w-[256px]">
            <button
              onClick={clearFilters}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Clear Filters</span>
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Sidebar;