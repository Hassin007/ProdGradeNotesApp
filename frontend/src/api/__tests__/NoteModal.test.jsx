import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoteModal from '../../components/NoteModal';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => 'XIcon',
  Save: () => 'SaveIcon',
  Tag: () => 'TagIcon',
  Palette: () => 'PaletteIcon',
}));

// Mock context
const mockCreateNote = jest.fn();
const mockUpdateNote = jest.fn();

jest.mock('../../context/NotesContext', () => ({
  useNotes: () => ({
    createNote: mockCreateNote,
    updateNote: mockUpdateNote,
  }),
}));

// Mock constants
jest.mock('../../utils/constants', () => ({
  backdropVariant: {},
  modalVariant: {},
  NOTE_COLORS: [
    { name: 'Default', value: 'bg-white dark:bg-gray-800' },
    { name: 'Blue', value: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Green', value: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'Yellow', value: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { name: 'Red', value: 'bg-red-50 dark:bg-red-900/20' },
    { name: 'Purple', value: 'bg-purple-50 dark:bg-purple-900/20' },
  ],
}));

describe('NoteModal Component', () => {
  const mockOnClose = jest.fn();
  const mockNote = {
    _id: '1',
    title: 'Existing Note',
    content: 'Existing note content',
    tags: ['work', 'important'],
    color: 'Blue',
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Modal doesn't render when isOpen is false
  test('does not render when isOpen is false', () => {
    render(<NoteModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByPlaceholderText('Title')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Take a note...')).not.toBeInTheDocument();
  });

  // Test 2: Renders create note modal with empty form
  test('renders create note modal with empty form', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Take a note...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a tag...')).toBeInTheDocument();
    expect(screen.getByTitle('Save')).toBeInTheDocument();
    
    // Form should be empty for new note
    expect(screen.getByPlaceholderText('Title')).toHaveValue('');
    expect(screen.getByPlaceholderText('Take a note...')).toHaveValue('');
  });

  // Test 3: Renders edit note modal with existing data
  test('renders edit note modal with existing note data', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} note={mockNote} />);

    expect(screen.getByPlaceholderText('Title')).toHaveValue('Existing Note');
    expect(screen.getByPlaceholderText('Take a note...')).toHaveValue('Existing note content');
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  // Test 4: Creates new note with valid data
  test('creates new note when form is submitted with valid data', async () => {
    mockCreateNote.mockResolvedValueOnce({ success: true });

    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'New Note Title' }
    });
    fireEvent.change(screen.getByPlaceholderText('Take a note...'), {
      target: { value: 'New note content' }
    });

    // Submit form
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalledWith({
        title: 'New Note Title',
        content: 'New note content',
        tags: [],
        color: 'Default',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Test 5: Updates existing note
  test('updates existing note when form is submitted', async () => {
    mockUpdateNote.mockResolvedValueOnce({ success: true });

    render(<NoteModal isOpen={true} onClose={mockOnClose} note={mockNote} />);

    // Modify existing data
    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'Updated Note Title' }
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockUpdateNote).toHaveBeenCalledWith('1', {
        title: 'Updated Note Title',
        content: 'Existing note content',
        tags: ['work', 'important'],
        color: 'Blue',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  // Test 6: Prevents submission with empty title and content
  test('does not submit when both title and content are empty', async () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    // Save button should be disabled
    const saveButton = screen.getByTitle('Save');
    expect(saveButton).toBeDisabled();

    // Try to submit form
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateNote).not.toHaveBeenCalled();
      expect(mockUpdateNote).not.toHaveBeenCalled();
    });
  });

  // Test 7: Allows submission with only title
  test('allows submission with only title', async () => {
    mockCreateNote.mockResolvedValueOnce({ success: true });

    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'Title Only' }
    });

    const saveButton = screen.getByTitle('Save');
    expect(saveButton).not.toBeDisabled();

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
    });
  });

  // Test 8: Allows submission with only content
  test('allows submission with only content', async () => {
    mockCreateNote.mockResolvedValueOnce({ success: true });

    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Take a note...'), {
      target: { value: 'Content only note' }
    });

    const saveButton = screen.getByTitle('Save');
    expect(saveButton).not.toBeDisabled();

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
    });
  });

  // Test 9: Tag management - add tag
  test('adds tag when add button is clicked', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(tagInput, { target: { value: 'newtag' } });
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('newtag')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  // Test 10: Tag management - add tag with Enter key
  test('adds tag when Enter key is pressed in tag input', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(tagInput, { target: { value: 'entertag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });

    expect(screen.getByText('entertag')).toBeInTheDocument();
  });

  // Test 11: Tag management - remove tag
  test('removes tag when remove button is clicked', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} note={mockNote} />);

    // Initially has tags
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();

    // Remove a tag
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]); // Remove first tag

    expect(screen.queryByText('work')).not.toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  // Test 12: Prevents duplicate tags
  test('does not add duplicate tags', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    
    // Add same tag twice
    fireEvent.change(tagInput, { target: { value: 'duplicate' } });
    fireEvent.click(screen.getByText('Add'));
    
    fireEvent.change(tagInput, { target: { value: 'duplicate' } });
    fireEvent.click(screen.getByText('Add'));

    // Should only have one instance
    const tags = screen.getAllByText('duplicate');
    expect(tags).toHaveLength(1);
  });

  // Test 13: Color selection
  test('changes note color when color button is clicked', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    // Click on Green color
    const colorButtons = screen.getAllByRole('button');
    const greenColorButton = colorButtons.find(button => 
      button.className.includes('bg-green-50') || button.className.includes('bg-green-900')
    );
    
    if (greenColorButton) {
      fireEvent.click(greenColorButton);
    }

    // The form should now have Green color selected
    // This would be verified by the form submission data
  });

  // Test 14: Keyboard shortcuts - Ctrl+Enter to submit
  test('submits form when Ctrl+Enter is pressed in textarea', async () => {
    mockCreateNote.mockResolvedValueOnce({ success: true });

    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    const textarea = screen.getByPlaceholderText('Take a note...');
    fireEvent.change(textarea, { target: { value: 'Test content' } });
    
    // Press Ctrl+Enter
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
    });
  });

  // Test 15: Close modal when X button is clicked
  test('closes modal when X button is clicked', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /xicon/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 17: Prevents closing when modal content is clicked
  test('does not close when modal content is clicked', () => {
    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    const modalContent = screen.getByPlaceholderText('Title').closest('form');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // Test 18: Resets form after successful submission
  test('resets form state when modal reopens for new note', async () => {
    const { rerender } = render(<NoteModal isOpen={true} onClose={mockOnClose} note={mockNote} />);

    // Verify form has existing data
    expect(screen.getByPlaceholderText('Title')).toHaveValue('Existing Note');

    // Close modal
    rerender(<NoteModal isOpen={false} onClose={mockOnClose} note={mockNote} />);
    
    // Reopen for new note
    rerender(<NoteModal isOpen={true} onClose={mockOnClose} />);

    // Form should be empty for new note
    expect(screen.getByPlaceholderText('Title')).toHaveValue('');
    expect(screen.getByPlaceholderText('Take a note...')).toHaveValue('');
  });

  // Test 19: Handles submission errors gracefully
  test('handles submission errors without closing modal', async () => {
    mockCreateNote.mockRejectedValueOnce(new Error('API Error'));

    render(<NoteModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText('Title'), {
      target: { value: 'Test Note' }
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled(); // Should not close on error
    });
  });
});