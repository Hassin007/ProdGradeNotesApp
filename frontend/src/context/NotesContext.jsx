import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const NotesContext = createContext(null);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    tags: '',
    isPinned: undefined,
    isArchived: false,
  });
  const {user} = useAuth()

  const fetchTimeoutRef = useRef(null);
  const isFetching = useRef(false);

  const fetchNotes = async (customFilters = null) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      setLoading(true);
      const filtersToUse = customFilters || filters;
      console.log('📝 Fetching notes with filters:', filtersToUse);
      
      const response = await notesAPI.getAllNotes(filtersToUse);
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      // toast.error('Failed to load notes');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const fetchTags = async () => {
    try {
      const response = await notesAPI.getUserTags();
      if (response.success) {
        setTags(response.data);
      } else {
        // Fallback: extract tags from current notes
        const allTags = notes.flatMap(note => note.tags || []);
        const uniqueTags = [...new Set(allTags)].filter(Boolean);
        setTags(uniqueTags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Fallback: extract tags from current notes
      const allTags = notes.flatMap(note => note.tags || []);
      const uniqueTags = [...new Set(allTags)].filter(Boolean);
      setTags(uniqueTags);
    }
  };

  useEffect(() => {
    fetchTags();
}, [user?._id]);

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
    fetchNotes();
  }, []);


  // Filter changes with debounce
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchNotes();
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [filters]);

  const refreshNotes = () => {
    console.log('🔄 Manual refresh triggered');
    fetchNotes();
  };


  const createNote = async (noteData) => {
    try {
      const response = await notesAPI.createNote(noteData);
      if (response.success) {
        setNotes((prev) => [response.data, ...prev]);
        toast.success('Note created!');
        await fetchTags(); 
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const response = await notesAPI.updateNote(id, noteData);
      if (response.success) {
        setNotes((prev) =>
          prev.map((note) => (note._id === id ? response.data : note))
        );
        toast.success('Note updated!');
        fetchTags(); // Refresh tags
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await notesAPI.deleteNote(id);
      if (response.success) {
        setNotes((prev) => prev.filter((note) => note._id !== id));
        fetchTags();
        toast.success('Note deleted!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete note';
      toast.error(message);
      return { success: false, message };
    }
  };

  const togglePin = async (id) => {
    try {
      const response = await notesAPI.togglePin(id);
      if (response.success) {
        setNotes((prev) =>
          prev.map((note) => (note._id === id ? response.data : note))
        );
        toast.success(response.message);
        return { success: true, data: response.data };
      }
    } catch (error) {
      toast.error('Failed to toggle pin');
      return { success: false };
    }
  };

  const archiveNote = async (id) => {
    try {
      const response = await notesAPI.archiveNote(id);
      if (response.success) {
        // Update the note's isArchived status instead of filtering
        setNotes((prev) =>
          prev.map((note) => 
            note._id === id ? { ...note, isArchived: true } : note
          )
        );
        toast.success('Note archived!');
        return { success: true };
      }
    } catch (error) {
      console.error('Error archiving note:', error);
      toast.error('Failed to archive note');
      return { success: false };
    }
  };

  const unarchiveNote = async (id) => {
    try {
      const response = await notesAPI.unarchiveNote(id);
      console.log('note unarchived');
      
      if (response.success) {
        // Instead of filtering out, update the note's isArchived status
        setNotes((prev) =>
          prev.map((note) => 
            note._id === id ? { ...note, isArchived: false } : note
          )
        );
        toast.success('Note restored to main notes!');
        return { success: true };
      }
    } catch (error) {
      console.error('Error unarchiving note:', error);
      toast.error('Failed to restore note');
      return { success: false };
    }
  };

  const bulkDelete = async (noteIds) => {
    try {
      const response = await notesAPI.bulkDelete(noteIds);
      if (response.success) {
        setNotes((prev) => prev.filter((note) => !noteIds.includes(note._id)));
        toast.success(`${response.deletedCount} note(s) deleted!`);
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to delete notes');
      return { success: false };
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tags: '',
      isPinned: undefined,
      isArchived: false,
    });
  };

  const resetNotes = () => {
  console.log('🔄 Resetting notes and tags');
  setNotes([]);
  setTags([]);
  setFilters({
    search: '',
    tags: '',
    isPinned: undefined,
    isArchived: false,
  });
};

  const value = {
    notes,
    setNotes,
    tags,
    setTags,
    loading,
    filters,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    archiveNote,
    unarchiveNote,
    bulkDelete,
    updateFilters,
    clearFilters,
    resetNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};