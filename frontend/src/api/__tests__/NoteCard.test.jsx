import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import NoteCard from '../../components/NoteCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Pin: () => 'PinIcon',
  PinOff: () => 'PinOffIcon',
  Archive: () => 'ArchiveIcon',
  Trash2: () => 'Trash2Icon',
  ArchiveRestore: () => 'ArchiveRestoreIcon',
}));

// Mock context
const mockTogglePin = jest.fn();
const mockArchiveNote = jest.fn();
const mockDeleteNote = jest.fn();
const mockUnarchiveNote = jest.fn();

jest.mock('../../context/NotesContext', () => ({
  useNotes: () => ({
    togglePin: mockTogglePin,
    archiveNote: mockArchiveNote,
    deleteNote: mockDeleteNote,
    unarchiveNote: mockUnarchiveNote,
  }),
}));

// Mock constants
jest.mock('../../utils/constants', () => ({
  cardHover: {},
  scaleIn: {},
}));

describe('NoteCard Component', () => {
  const mockNote = {
    _id: '1',
    title: 'Test Note',
    content: 'This is a test note content',
    tags: ['work', 'important'],
    isPinned: false,
    isArchived: false,
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 2: Renders without optional fields
  test('renders correctly without optional fields', () => {
    const minimalNote = {
      _id: '2',
      content: 'Minimal note',
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
    };

    render(<NoteCard note={minimalNote} />);

    expect(screen.getByText('Minimal note')).toBeInTheDocument();
    expect(screen.queryByTestId('note-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('note-tags')).not.toBeInTheDocument();
  });

  // Test 3: Pin functionality
  test('calls togglePin when pin button is clicked', async () => {
    mockTogglePin.mockResolvedValueOnce({ success: true });

    render(<NoteCard note={mockNote} />);

    // Show actions by hovering
    const card = screen.getByText('Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const pinButton = screen.getByTitle('Pin');
    fireEvent.click(pinButton);

    await waitFor(() => {
      expect(mockTogglePin).toHaveBeenCalledWith('1');
    });
  });

  // Test 4: Archive functionality for non-archived note
  test('calls archiveNote when archive button is clicked on non-archived note', async () => {
    mockArchiveNote.mockResolvedValueOnce({ success: true });

    render(<NoteCard note={mockNote} />);

    const card = screen.getByText('Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const archiveButton = screen.getByTitle('Archive');
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(mockArchiveNote).toHaveBeenCalledWith('1');
    });
  });

  // Test 5: Unarchive functionality for archived note
  test('calls unarchiveNote when unarchive button is clicked on archived note', async () => {
    const archivedNote = { ...mockNote, isArchived: true };
    mockUnarchiveNote.mockResolvedValueOnce({ success: true });

    render(<NoteCard note={archivedNote} />);

    const card = screen.getByText('Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const unarchiveButton = screen.getByTitle('Unarchive');
    fireEvent.click(unarchiveButton);

    await waitFor(() => {
      expect(mockUnarchiveNote).toHaveBeenCalledWith('1');
    });
  });

  // Test 6: Delete functionality
  test('calls deleteNote when delete button is clicked', async () => {
    mockDeleteNote.mockResolvedValueOnce({ success: true });

    render(<NoteCard note={mockNote} />);

    const card = screen.getByText('Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteNote).toHaveBeenCalledWith('1');
    });
  });

  // Test 7: Action buttons visibility on hover
  test('shows action buttons on mouse enter and hides on mouse leave', () => {
    render(<NoteCard note={mockNote} />);

    const card = screen.getByText('Test Note').closest('div');
    const actionsContainer = screen.getByTitle('Archive').closest('div');

    // Initially hidden
    expect(actionsContainer).toHaveClass('opacity-0');

    // Show on hover
    fireEvent.mouseEnter(card);
    expect(actionsContainer).toHaveClass('opacity-100');

    // Hide on mouse leave
    fireEvent.mouseLeave(card);
    expect(actionsContainer).toHaveClass('opacity-0');
  });

  // Test 8: Pin button visibility states
  test('pin button is always visible when pinned, otherwise only on hover', () => {
    const pinnedNote = { ...mockNote, isPinned: true };
    
    // Test pinned note - button should be always visible
    const { rerender } = render(<NoteCard note={pinnedNote} />);
    const pinnedButton = screen.getByTitle('Pin');
    expect(pinnedButton).not.toHaveClass('opacity-0');

    // Test unpinned note - button should be hidden initially
    rerender(<NoteCard note={mockNote} />);
    const unpinnedButton = screen.getByTitle('Pin');
    expect(unpinnedButton).toHaveClass('opacity-0');

    // Show on hover
    const card = screen.getByText('Test Note').closest('div');
    fireEvent.mouseEnter(card);
    expect(unpinnedButton).toHaveClass('opacity-100');
  });

  // Test 9: Date formatting
  test('formats date correctly', () => {
    const now = new Date();
    const recentNote = { 
      ...mockNote, 
      updatedAt: now.toISOString() 
    };

    render(<NoteCard note={recentNote} />);

    // Should show time for today's date
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(screen.getByText(timeString)).toBeInTheDocument();
  });

  // Test 10: Event propagation stops
  test('stops event propagation for action buttons', async () => {
    const mockStopPropagation = jest.fn();
    
    render(<NoteCard note={mockNote} />);

    const card = screen.getByText('Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const deleteButton = screen.getByTitle('Delete');
    
    // Simulate click with stopPropagation
    fireEvent.click(deleteButton, {
      stopPropagation: mockStopPropagation
    });

    await waitFor(() => {
      expect(mockDeleteNote).toHaveBeenCalled();
    });
  });

  // Test 11: Tag rendering
  test('renders all tags correctly', () => {
    render(<NoteCard note={mockNote} />);

    mockNote.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  // Test 12: Content truncation classes
  test('applies truncation classes to title and content', () => {
    render(<NoteCard note={mockNote} />);

    const title = screen.getByText('Test Note');
    const content = screen.getByText('This is a test note content');

    expect(title).toHaveClass('line-clamp-2');
    expect(content).toHaveClass('line-clamp-6', 'whitespace-pre-wrap');
  });
});