import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/NoteCard';
import FloatingButton from '../components/FloatingButton';
import NoteModal from '../components/NoteModal';
import TagFilter from '../components/TagFilter';
import { staggerContainer, slideUp } from '../utils/constants';

const Home = () => {
  const { notes, loading, filters, updateFilters, tags } = useNotes();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    console.log('Home mounted');
    
    updateFilters({isArchived: false})
  }, [])

  // Filter notes based on current filters
  const filteredNotes = notes.filter(note => {
    if (filters.isArchived !== undefined && note.isArchived !== filters.isArchived) {
      return false;
    }
    if (filters.tags && (!note.tags || !note.tags.includes(filters.tags))) {
      return false;
    }
    return true;
  });

  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

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
            Welcome to Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please login to view your notes
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <motion.div
        variants={slideUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {filters.tags ? `#${filters.tags}` : 'All Notes'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
        </p>
        
        {/* Tag Filter */}
        <div className="mt-4">
          <TagFilter key={tags.join(',')} />
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Notes Grid */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Pinned
                </h2>
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {pinnedNotes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => handleEditNote(note)}
                      className="cursor-pointer"
                    >
                      <NoteCard note={note} />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Other Notes Section */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Others
                  </h2>
                )}
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {unpinnedNotes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => handleEditNote(note)}
                      className="cursor-pointer"
                    >
                      <NoteCard note={note} />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notes found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filters.search || filters.tags
                    ? 'Try adjusting your search or filters'
                    : 'Create your first note to get started'
                  }
                </p>
                {!(filters.search || filters.tags) && (
                  <button
                    onClick={handleCreateNote}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Create Note
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <FloatingButton onClick={handleCreateNote} />

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        note={selectedNote}
      />
    </>
  );
};

export default Home;