import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff, Archive, Trash2, ArchiveRestore } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { cardHover, scaleIn } from '../utils/constants';

const NoteCard = ({ note }) => {
  const { togglePin, archiveNote, deleteNote, unarchiveNote } = useNotes();
  const [showActions, setShowActions] = useState(false);

  const handlePin = async (e) => {
    e.stopPropagation();
    await togglePin(note._id);
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    await archiveNote(note._id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    // if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note._id);
  };

  const handleUnarchive = async (e) => {
    e.stopPropagation();
    await unarchiveNote(note._id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
      whileHover="hover"
      className="relative"
    >
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Note Content */}
        <div className="p-4">
          {/* Title & Pin */}
          <div className="flex items-start justify-between mb-2">
            {note.title && (
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 flex-1 mr-2">
                {note.title}
              </h3>
            )}
            <button
              title='Pin'
              onClick={handlePin}
              className={`p-1 rounded-full transition-colors ${
                note.isPinned
                  ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100'
              } ${showActions ? 'opacity-100' : ''}`}
            >
              {note.isPinned ? (
                <Pin className="w-4 h-4 fill-current" />
              ) : (
                <PinOff className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Content */}
          {note.content && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-6 whitespace-pre-wrap">
              {note.content}
            </p>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Date and Actions */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(note.updatedAt)}
          </span>

          {/* Action Buttons */}
          <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={note.isArchived ? handleUnarchive : handleArchive}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title={note.isArchived ? "Unarchive" : "Archive"}
            >
              {note.isArchived ? (
                <ArchiveRestore className="w-4 h-4" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoteCard;