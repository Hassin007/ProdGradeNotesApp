import { jest } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { NotesProvider, useNotes } from '../../context/NotesContext';


jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));


jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user1', name: 'Test User' },
    isAuthenticated: true,
  }),
}));


jest.mock('../../services/api', () => ({
  notesAPI: {
    getAllNotes: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    getUserTags: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    togglePin: jest.fn(),
    archiveNote: jest.fn(),
    unarchiveNote: jest.fn(),
    bulkDelete: jest.fn(),
  },
  authAPI: {
    getCurrentUser: jest.fn(),
  },
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: { response: { use: jest.fn() } },
  }
}));

// Import the mocked module
import { notesAPI } from '../../services/api';

const wrapper = ({ children }) => <NotesProvider>{children}</NotesProvider>;

describe('NotesContext React Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    
    notesAPI.getAllNotes.mockImplementation(() => Promise.resolve({ success: true, data: [] }));
    notesAPI.getUserTags.mockImplementation(() => Promise.resolve({ success: true, data: [] }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should provide notes context with initial values', async () => {
    const { result } = renderHook(() => useNotes(), { wrapper });

    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notes).toEqual([]);
    expect(result.current.tags).toEqual([]);
    expect(result.current.filters).toEqual({
      search: '',
      tags: '',
      isPinned: undefined,
      isArchived: false,
    });
    expect(typeof result.current.fetchNotes).toBe('function');
    expect(typeof result.current.createNote).toBe('function');
    expect(typeof result.current.updateNote).toBe('function');
    expect(typeof result.current.deleteNote).toBe('function');
  });

  test('fetchNotes should load notes and update state', async () => {
    const mockNotes = [
      { _id: '1', title: 'Test Note 1', content: 'Content 1' },
      { _id: '2', title: 'Test Note 2', content: 'Content 2' }
    ];
    
    notesAPI.getAllNotes.mockResolvedValue({
      success: true,
      data: mockNotes
    });

    const { result } = renderHook(() => useNotes(), { wrapper });

    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.fetchNotes();
    });

    expect(notesAPI.getAllNotes).toHaveBeenCalledWith(result.current.filters);
    expect(result.current.notes).toEqual(mockNotes);
  });

  test('createNote should add new note to state', async () => {
    const newNote = { title: 'New Note', content: 'New Content' };
    const mockResponse = {
      success: true,
      data: { _id: '3', ...newNote, tags: [] }
    };

    notesAPI.createNote.mockResolvedValue(mockResponse);
    notesAPI.getUserTags.mockResolvedValue({ success: true, data: [] });

    const { result } = renderHook(() => useNotes(), { wrapper });

    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let createResult;
    await act(async () => {
      createResult = await result.current.createNote(newNote);
    });

    expect(notesAPI.createNote).toHaveBeenCalledWith(newNote);
    expect(result.current.notes).toContainEqual(mockResponse.data);
    expect(createResult).toEqual({ success: true, data: mockResponse.data });
  });

  test('updateNote should modify existing note', async () => {
    const existingNote = { _id: '1', title: 'Old Title', content: 'Old Content' };
    const updatedNote = { _id: '1', title: 'Updated Title', content: 'Updated Content' };
    
    
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setNotes([existingNote]);
    });

    notesAPI.updateNote.mockResolvedValue({
      success: true,
      data: updatedNote
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.current.updateNote('1', { title: 'Updated Title' });
    });

    expect(notesAPI.updateNote).toHaveBeenCalledWith('1', { title: 'Updated Title' });
    expect(result.current.notes).toContainEqual(updatedNote);
    expect(result.current.notes).not.toContainEqual(existingNote);
    expect(updateResult).toEqual({ success: true, data: updatedNote });
  });

  test('deleteNote should remove note from state', async () => {
    const noteToDelete = { _id: '1', title: 'To Delete' };
    const otherNote = { _id: '2', title: 'To Keep' };
    
    // Set initial state
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setNotes([noteToDelete, otherNote]);
    });

    notesAPI.deleteNote.mockResolvedValue({ success: true });

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.deleteNote('1');
    });

    expect(notesAPI.deleteNote).toHaveBeenCalledWith('1');
    expect(result.current.notes).not.toContainEqual(noteToDelete);
    expect(result.current.notes).toContainEqual(otherNote);
    expect(deleteResult).toEqual({ success: true });
  });

  test('updateFilters should debounce note fetching', async () => {
    const mockNotes = [{ _id: '1', title: 'Filtered Note' }];
    notesAPI.getAllNotes.mockResolvedValue({
      success: true,
      data: mockNotes
    });

    const { result } = renderHook(() => useNotes(), { wrapper });

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear any initial calls
    notesAPI.getAllNotes.mockClear();

    act(() => {
      result.current.updateFilters({ search: 'test' });
    });

    // Should not call immediately due to debounce
    expect(notesAPI.getAllNotes).not.toHaveBeenCalled();

    // Fast-forward timers beyond the debounce time (300ms)
    act(() => {
      jest.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(notesAPI.getAllNotes).toHaveBeenCalledWith({
        search: 'test',
        tags: '',
        isPinned: undefined,
        isArchived: false,
      });
    });
  });

  test('togglePin should update note pin status', async () => {
    const note = { _id: '1', title: 'Test Note', isPinned: false };
    
    // Set initial state
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setNotes([note]);
    });

    const pinnedNote = { ...note, isPinned: true };
    notesAPI.togglePin.mockResolvedValue({
      success: true,
      data: pinnedNote
    });

    await act(async () => {
      await result.current.togglePin('1');
    });

    expect(notesAPI.togglePin).toHaveBeenCalledWith('1');
    expect(result.current.notes).toContainEqual(pinnedNote);
  });

  test('resetNotes should clear all notes and filters', async () => {
    const { result } = renderHook(() => useNotes(), { wrapper });

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Set some state first
    act(() => {
      result.current.setNotes([{ _id: '1', title: 'Test' }]);
      result.current.setTags(['tag1', 'tag2']);
      result.current.updateFilters({ search: 'test', isArchived: true });
    });

    act(() => {
      result.current.resetNotes();
    });

    expect(result.current.notes).toEqual([]);
    expect(result.current.tags).toEqual([]);
    expect(result.current.filters).toEqual({
      search: '',
      tags: '',
      isPinned: undefined,
      isArchived: false,
    });
  });
});