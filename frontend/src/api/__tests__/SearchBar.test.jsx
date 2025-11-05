import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import SearchBar from '../../components/SearchBar';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => 'SearchIcon',
  X: () => 'XIcon',
}));

// Mock constants
jest.mock('../../utils/constants', () => ({
  slideUp: {},
}));

// Create mock functions
const mockUpdateFilters = jest.fn();

// Mock context - FIXED VERSION
jest.mock('../../context/NotesContext', () => ({
  useNotes: jest.fn(),
}));

const mockUseNotes = require('../../context/NotesContext').useNotes;

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation to use empty filters by default
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: {
        search: '',
      },
    });
  });

  // Test 1: Basic rendering for desktop variant
  test('renders desktop search bar with correct elements', () => {
    render(<SearchBar variant="desktop" />);

    expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
    expect(screen.getByText('SearchIcon')).toBeInTheDocument();
    expect(screen.queryByText('XIcon')).not.toBeInTheDocument(); // Clear button should not be visible when empty
  });

  // Test 2: Basic rendering for mobile variant
  test('renders mobile search bar with correct elements', () => {
    render(<SearchBar variant="mobile" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    expect(searchInput).toBeInTheDocument();
    
    const searchContainer = searchInput.parentElement;
    expect(searchContainer).toHaveClass('w-full');
  });

  // Test 3: Desktop variant styling
  test('applies correct desktop styling', () => {
    render(<SearchBar variant="desktop" />);

    const searchContainer = screen.getByPlaceholderText('Search notes...').parentElement;
    expect(searchContainer).toHaveClass('max-w-2xl');
    expect(searchContainer).toHaveClass('mx-4');
    expect(searchContainer).toHaveClass('hidden');
    expect(searchContainer).toHaveClass('md:block');
  });

  // Test 4: Mobile variant styling
  test('applies correct mobile styling', () => {
    render(<SearchBar variant="mobile" />);

    const searchContainer = screen.getByPlaceholderText('Search notes...').parentElement;
    expect(searchContainer).toHaveClass('w-full');
    expect(searchContainer).not.toHaveClass('hidden');
  });

  // Test 5: Search input functionality
  test('updates search value and calls updateFilters on input change', async () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput).toHaveValue('test search');
    
    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: 'test search' });
    });
  });

  // Test 6: Clear search functionality
  test('clears search when clear button is clicked', async () => {
    // Mock with existing search value to show clear button
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: {
        search: 'existing search',
      },
    });

    render(<SearchBar variant="desktop" />);

    // Clear button should be visible
    const clearButton = screen.getByText('XIcon');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: '' });
    });
  });

  // Test 7: Clear button visibility
  test('shows clear button only when search has value', () => {
    // Test with empty search
    const { rerender } = render(<SearchBar variant="desktop" />);
    expect(screen.queryByText('XIcon')).not.toBeInTheDocument();

    // Test with search value
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: {
        search: 'test',
      },
    });

    rerender(<SearchBar variant="desktop" />);
    expect(screen.getByText('XIcon')).toBeInTheDocument();
  });

  // Test 8: Input synchronization with context filters
  test('syncs input value with context filters', () => {
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: {
        search: 'context search',
      },
    });

    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    expect(searchInput).toHaveValue('context search');
  });

  // Test 9: Input styling and classes
  test('applies correct input styling', () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    expect(searchInput).toHaveClass('w-full');
    expect(searchInput).toHaveClass('pl-10');
    expect(searchInput).toHaveClass('pr-10');
    expect(searchInput).toHaveClass('py-2');
    expect(searchInput).toHaveClass('bg-gray-100');
    expect(searchInput).toHaveClass('dark:bg-gray-700');
    expect(searchInput).toHaveClass('rounded-lg');
  });

  // Test 10: Focus state styling
  test('applies focus state styling', () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    expect(searchInput).toHaveClass('focus:border-blue-500');
    expect(searchInput).toHaveClass('dark:focus:border-blue-400');
    expect(searchInput).toHaveClass('focus:outline-none');
  });

  // Test 13: Real-time search updates
  test('updates filters in real-time as user types', async () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    // Type multiple characters
    fireEvent.change(searchInput, { target: { value: 'n' } });
    fireEvent.change(searchInput, { target: { value: 'no' } });
    fireEvent.change(searchInput, { target: { value: 'not' } });
    fireEvent.change(searchInput, { target: { value: 'note' } });

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: 'note' });
    });

    expect(mockUpdateFilters).toHaveBeenCalledTimes(4);
  });

  // Test 14: Empty search value handling
  test('handles empty search value correctly', async () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    // Set value then clear it by typing
    fireEvent.change(searchInput, { target: { value: 'test' } });
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: '' });
    });
  });

  // Test 15: Component re-renders when filters change
  test('updates input value when filters change externally', () => {
    const { rerender } = render(<SearchBar variant="desktop" />);

    // Initial render with empty search
    let searchInput = screen.getByPlaceholderText('Search notes...');
    expect(searchInput).toHaveValue('');

    // Update mock to return different filter value
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: {
        search: 'external update',
      },
    });

    // Re-render component
    rerender(<SearchBar variant="desktop" />);

    // Input should reflect new filter value
    searchInput = screen.getByPlaceholderText('Search notes...');
    expect(searchInput).toHaveValue('external update');
  });

  // Test 16: Animation variants based on variant prop
  test('applies correct animation variants based on variant prop', () => {
    // Test mobile variant with slideUp
    const { rerender } = render(<SearchBar variant="mobile" />);
    
    let searchContainer = screen.getByPlaceholderText('Search notes...').parentElement;
    expect(searchContainer).toHaveAttribute('variants'); // Should have variants prop for motion

    // Test desktop variant without slideUp
    rerender(<SearchBar variant="desktop" />);
    
    searchContainer = screen.getByPlaceholderText('Search notes...').parentElement;
    expect(searchContainer).toHaveAttribute('variants'); // Still has variants but different behavior
  });

  // Test 17: Accessibility attributes
  test('has proper accessibility attributes', () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    expect(searchInput).toHaveAttribute('type', 'text');
    expect(searchInput).toHaveAttribute('placeholder', 'Search notes...');
  });

  // Test 18: Performance - handles rapid input changes correctly
  test('handles rapid input changes correctly', async () => {
    render(<SearchBar variant="desktop" />);

    const searchInput = screen.getByPlaceholderText('Search notes...');
    
    // Rapid typing simulation
    const rapidText = 'quick search';
    for (let i = 0; i < rapidText.length; i++) {
      fireEvent.change(searchInput, { 
        target: { value: rapidText.slice(0, i + 1) } 
      });
    }

    await waitFor(() => {
      // Should eventually call with the final value
      expect(mockUpdateFilters).toHaveBeenCalledWith({ search: 'quick search' });
    });
  });
});