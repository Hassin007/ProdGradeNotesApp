import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Tag, Palette } from 'lucide-react';
import { useNotes } from '../context/NotesContext';
import { backdropVariant, modalVariant, NOTE_COLORS } from '../utils/constants';

const NoteModal = ({ isOpen, onClose, note = null }) => {
  const { createNote, updateNote } = useNotes();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    color: 'Default',
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags || [],
        color: note.color || 'Default',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: [],
        color: 'Default',
      });
    }
  }, [note, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() && !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      if (note) {
        await updateNote(note._id, formData);
      } else {
        await createNote(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        handleSubmit(e);
      } else {
        addTag();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      variants={backdropVariant}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`w-full max-w-2xl rounded-xl shadow-xl ${NOTE_COLORS.find(c => c.name === formData.color)?.value || 'bg-white dark:bg-gray-800'} border border-gray-200 dark:border-gray-700`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full" role='form'>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="flex-1 bg-transparent text-lg font-semibold text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <textarea
              placeholder="Take a note..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              onKeyDown={handleKeyPress}
              className="w-full h-64 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
            />
          </div>

          {/* Tags Section */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex gap-1">
                {NOTE_COLORS.slice(0, 6).map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.name }))}
                    className={`w-6 h-6 rounded-full border-2 ${formData.color === color.name ? 'border-gray-900 dark:border-white' : 'border-transparent'} ${color.value.includes('bg-') ? color.value : 'bg-white'} ${!color.value.includes('bg-') && color.name === 'Default' ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              title='Save'
              type="submit"
              disabled={isSubmitting || (!formData.title.trim() && !formData.content.trim())}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default NoteModal;