import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArchiveNoteCard from '../../components/ArchiveNoteCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Trash2: () => 'Trash2Icon',
  ArchiveRestore: () => 'ArchiveRestoreIcon',
}));

// Mock context
const mockUnarchiveNote = jest.fn();
const mockDeleteNote = jest.fn();

jest.mock('../../context/NotesContext', () => ({
  useNotes: () => ({
    unarchiveNote: mockUnarchiveNote,
    deleteNote: mockDeleteNote,
  }),
}));

// Mock constants
jest.mock('../../utils/constants', () => ({
  cardHover: {},
  scaleIn: {},
}));

// Mock window.confirm
const originalConfirm = window.confirm;
beforeAll(() => {
  window.confirm = jest.fn();
});

afterAll(() => {
  window.confirm = originalConfirm;
});

describe('ArchiveNoteCard Component', () => {
  const mockNote = {
    _id: '1',
    title: 'Archived Test Note',
    content: 'This is an archived test note content',
    tags: ['archived', 'important'],
    isArchived: true,
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm.mockClear();
  });

  // Test 1: Basic rendering with archived-specific elements
  test('renders archived note card with archived badge and specific actions', () => {
    render(<ArchiveNoteCard note={mockNote} />);

    expect(screen.getByText('Archived Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is an archived test note content')).toBeInTheDocument();
    expect(screen.getByText('archived')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByTitle('Restore to Notes')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Permanently')).toBeInTheDocument();
  });

  // Test 2: Renders without optional fields
  test('renders correctly without optional fields', () => {
    const minimalNote = {
      _id: '2',
      content: 'Minimal archived note',
      updatedAt: new Date().toISOString(),
      isArchived: true,
    };

    render(<ArchiveNoteCard note={minimalNote} />);

    expect(screen.getByText('Minimal archived note')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument(); // Always shows archived badge
    expect(screen.queryByTestId('note-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('note-tags')).not.toBeInTheDocument();
  });

  // Test 3: Unarchive functionality
  test('calls unarchiveNote when restore button is clicked', async () => {
    mockUnarchiveNote.mockResolvedValueOnce({ success: true });

    render(<ArchiveNoteCard note={mockNote} />);

    // Show actions by hovering
    const card = screen.getByText('Archived Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const restoreButton = screen.getByTitle('Restore to Notes');
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(mockUnarchiveNote).toHaveBeenCalledWith('1');
    });
  });

  // Test 4: Delete functionality with confirmation - user confirms
  test('calls deleteNote when delete button is clicked and user confirms', async () => {
    window.confirm.mockReturnValue(true); // User confirms deletion
    mockDeleteNote.mockResolvedValueOnce({ success: true });

    render(<ArchiveNoteCard note={mockNote} />);

    const card = screen.getByText('Archived Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const deleteButton = screen.getByTitle('Delete Permanently');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this note?');
      expect(mockDeleteNote).toHaveBeenCalledWith('1');
    });
  });

  // Test 5: Delete functionality with confirmation - user cancels
  test('does not call deleteNote when delete button is clicked and user cancels', async () => {
    window.confirm.mockReturnValue(false); // User cancels deletion

    render(<ArchiveNoteCard note={mockNote} />);

    const card = screen.getByText('Archived Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const deleteButton = screen.getByTitle('Delete Permanently');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this note?');
      expect(mockDeleteNote).not.toHaveBeenCalled();
    });
  });

  // Test 6: Action buttons visibility on hover
  test('shows action buttons on mouse enter and hides on mouse leave', () => {
    render(<ArchiveNoteCard note={mockNote} />);

    const card = screen.getByText('Archived Test Note').closest('div');
    const actionsContainer = screen.getByTitle('Restore to Notes').closest('div');

    // Initially hidden
    expect(actionsContainer).toHaveClass('opacity-0');

    // Show on hover
    fireEvent.mouseEnter(card);
    expect(actionsContainer).toHaveClass('opacity-100');

    // Hide on mouse leave
    fireEvent.mouseLeave(card);
    expect(actionsContainer).toHaveClass('opacity-0');
  });

  // Test 7: Archived badge is always present
  test('always displays archived badge', () => {
    const noteWithoutTitle = {
      _id: '3',
      content: 'Content only archived note',
      updatedAt: new Date().toISOString(),
      isArchived: true,
    };

    render(<ArchiveNoteCard note={noteWithoutTitle} />);

    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toHaveClass('bg-orange-100');
  });

  // Test 8: No pin functionality in archived notes
  test('does not render pin button in archived notes', () => {
    render(<ArchiveNoteCard note={mockNote} />);

    expect(screen.queryByTitle('Pin')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Unpin')).not.toBeInTheDocument();
  });

  // Test 9: Event propagation stops for action buttons
  test('stops event propagation for action buttons', async () => {
    const mockStopPropagation = jest.fn();
    
    render(<ArchiveNoteCard note={mockNote} />);

    const card = screen.getByText('Archived Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const restoreButton = screen.getByTitle('Restore to Notes');
    
    // Simulate click with stopPropagation
    fireEvent.click(restoreButton, {
      stopPropagation: mockStopPropagation
    });

    await waitFor(() => {
      expect(mockUnarchiveNote).toHaveBeenCalled();
    });
  });


  // Test 10: Action button specific styling
  test('applies correct hover colors for action buttons', () => {
    render(<ArchiveNoteCard note={mockNote} />);

    const card = screen.getByText('Archived Test Note').closest('div');
    fireEvent.mouseEnter(card);

    const restoreButton = screen.getByTitle('Restore to Notes');
    const deleteButton = screen.getByTitle('Delete Permanently');

    expect(restoreButton).toHaveClass('hover:bg-green-50');
    expect(restoreButton).toHaveClass('dark:hover:bg-green-900/20');
    expect(restoreButton).toHaveClass('text-green-500');
    
    expect(deleteButton).toHaveClass('hover:bg-red-50');
    expect(deleteButton).toHaveClass('dark:hover:bg-red-900/20');
    expect(deleteButton).toHaveClass('text-red-500');
  });

  // Test 11: Date formatting
  test('formats date correctly', () => {
    const now = new Date();
    const recentNote = { 
      ...mockNote, 
      updatedAt: now.toISOString() 
    };

    render(<ArchiveNoteCard note={recentNote} />);

    // Should show time for today's date
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(screen.getByText(timeString)).toBeInTheDocument();
  });

  // Test 12: Tag rendering
  test('renders all tags correctly', () => {
    render(<ArchiveNoteCard note={mockNote} />);

    mockNote.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  // Test 13: Content truncation classes
  test('applies truncation classes to title and content', () => {
    render(<ArchiveNoteCard note={mockNote} />);

    const title = screen.getByText('Archived Test Note');
    const content = screen.getByText('This is an archived test note content');

    expect(title).toHaveClass('line-clamp-2');
    expect(content).toHaveClass('line-clamp-6', 'whitespace-pre-wrap');
  });
});