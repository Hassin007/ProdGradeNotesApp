import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import ArchiveNoteCard from '../components/ArchiveNoteCard';
import { staggerContainer, slideUp } from '../utils/constants';
import { useEffect } from 'react';

const Archive = () => {
  const { notes, loading, updateFilters } = useNotes();
  const { isAuthenticated } = useAuth();

  // Get archived notes
  const archivedNotes = notes.filter(note => note.isArchived);

  useEffect(() => {
    console.log('archive mounted');
    
    updateFilters({isArchived: true})
  }, [])
  

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please login to view archived notes
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 text-lg"><img src="/image.png" width="128" height="128"/></span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Archives</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {archivedNotes.length} archived note{archivedNotes.length !== 1 ? 's' : ''}
          </p>
          
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Archived Notes Grid */}
        <AnimatePresence>
          {!loading && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {archivedNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {archivedNotes.map((note) => (
                    <motion.div
                      key={note._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <ArchiveNoteCard note={note} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl"><img src="/image.png" width="128" height="128"/></span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Archive is empty
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notes you archive will appear here
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Archive;