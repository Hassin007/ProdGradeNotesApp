import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => 'SearchIcon',
  Moon: () => 'MoonIcon',
  Sun: () => 'SunIcon',
  LogOut: () => 'LogOutIcon',
  Menu: () => 'MenuIcon',
  X: () => 'XIcon',
  Archive: () => 'ArchiveIcon',
  Home: () => 'HomeIcon',
  PanelLeft: () => 'PanelLeftIcon',
}));

// Mock contexts
const mockLogout = jest.fn();
const mockToggleTheme = jest.fn();
const mockUpdateFilters = jest.fn();
const mockResetNotes = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../../context/NotesContext', () => ({
  useNotes: jest.fn(),
}));

// Mock react-router-dom completely to avoid TextEncoder issue
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

// Mock Logo component
jest.mock('../../components/Logo', () => () => 'Logo');

// Mock constants
jest.mock('../../utils/constants', () => ({
  slideUp: {},
}));

// Get mock functions
const mockUseAuth = require('../../context/AuthContext').useAuth;
const mockUseTheme = require('../../context/ThemeContext').useTheme;
const mockUseNotes = require('../../context/NotesContext').useNotes;
const mockUseLocation = require('react-router-dom').useLocation;

describe('Navbar Component', () => {
  const mockOnMenuToggle = jest.fn();
  const defaultUser = {
    fullName: 'John Doe',
    username: 'johndoe',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: defaultUser,
      logout: mockLogout,
    });
    
    mockUseTheme.mockReturnValue({
      isDark: false,
      toggleTheme: mockToggleTheme,
    });
    
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: { search: '' },
      resetNotes: mockResetNotes,
    });
    
    mockUseLocation.mockReturnValue({
      pathname: '/',
    });
  });

  const renderNavbar = (props = {}) => {
    return render(
      <BrowserRouter>
        <Navbar onMenuToggle={mockOnMenuToggle} isSidebarOpen={false} {...props} />
      </BrowserRouter>
    );
  };

  test('calls onMenuToggle when menu button is clicked', () => {
    renderNavbar();

    const menuButton = screen.getByTitle('Expand sidebar');
    fireEvent.click(menuButton);

    expect(mockOnMenuToggle).toHaveBeenCalled();
  });

  //  Menu button icon changes based on sidebar state
  test('shows different menu icon based on sidebar state', () => {
    const { rerender } = renderNavbar({ isSidebarOpen: false });
    expect(screen.getByTitle('Expand sidebar')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <Navbar onMenuToggle={mockOnMenuToggle} isSidebarOpen={true} />
      </BrowserRouter>
    );
    expect(screen.getByTitle('Collapse sidebar')).toBeInTheDocument();
  });


  //  Navigation to home
  test('navigates to home when logo or home button is clicked', () => {
    renderNavbar();

    // Click logo
    const logo = screen.getByText('Notiq');
    fireEvent.click(logo);

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockUpdateFilters).toHaveBeenCalledWith({ isArchived: false });

    // Click home button
    const homeButton = screen.getByText('Home');
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockUpdateFilters).toHaveBeenCalledWith({ isArchived: false });
  });

  //  Navigation to archive
  test('navigates to archive when archive button is clicked', () => {
    renderNavbar();

    const archiveButton = screen.getByText('Archive');
    fireEvent.click(archiveButton);

    expect(mockNavigate).toHaveBeenCalledWith('/archive');
    expect(mockUpdateFilters).toHaveBeenCalledWith({ isArchived: true });
  });

  //  Theme toggle functionality
  test('toggles theme when theme button is clicked', () => {
    renderNavbar();

    const themeButton = screen.getByLabelText('Toggle theme');
    fireEvent.click(themeButton);

    expect(mockToggleTheme).toHaveBeenCalled();
  });

  //  Theme button shows correct icon based on theme
  test('shows correct theme icon based on current theme', () => {
    // Test light theme
    const { rerender } = renderNavbar();
    expect(screen.getByText('MoonIcon')).toBeInTheDocument();

    // Test dark theme
    mockUseTheme.mockReturnValue({
      isDark: true,
      toggleTheme: mockToggleTheme,
    });

    rerender(
      <BrowserRouter>
        <Navbar onMenuToggle={mockOnMenuToggle} isSidebarOpen={false} />
      </BrowserRouter>
    );
    expect(screen.getByText('SunIcon')).toBeInTheDocument();
  });

  //  Logout functionality
  test('handles logout correctly', async () => {
    mockLogout.mockResolvedValueOnce({ success: true });

    renderNavbar();

    const logoutButton = screen.getByLabelText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockResetNotes).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  //  Active state styling for navigation
  test('applies active state styling to current route', () => {
    // Test home active
    mockUseLocation.mockReturnValue({ pathname: '/' });
    const { rerender } = renderNavbar();

    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).toHaveClass('bg-blue-100');

    // Test archive active
    mockUseLocation.mockReturnValue({ pathname: '/archive' });
    rerender(
      <BrowserRouter>
        <Navbar onMenuToggle={mockOnMenuToggle} isSidebarOpen={false} />
      </BrowserRouter>
    );

    const archiveButton = screen.getByText('Archive').closest('button');
    expect(archiveButton).toHaveClass('bg-blue-100');
  });

  //  Mobile menu toggle functionality
  test('toggles mobile menu when mobile menu button is clicked', () => {
    renderNavbar();

    const mobileMenuButton = screen.getAllByText('MenuIcon')[1]; // Second menu button is for mobile
    fireEvent.click(mobileMenuButton);

    // Mobile menu should now be open
    expect(screen.getByText('XIcon')).toBeInTheDocument();
  });

  //  Mobile menu navigation
  test('mobile menu navigation works correctly', () => {
    renderNavbar();

    // Open mobile menu
    const mobileMenuButton = screen.getAllByText('MenuIcon')[1];
    fireEvent.click(mobileMenuButton);

    // Navigate via mobile menu
    const mobileHomeButton = screen.getAllByText('Home')[1]; // Second Home button is in mobile menu
    fireEvent.click(mobileHomeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockUpdateFilters).toHaveBeenCalledWith({ isArchived: false });
  });

  //  Mobile menu logout
  test('mobile menu logout works correctly', async () => {
    mockLogout.mockResolvedValueOnce({ success: true });

    renderNavbar();

    // Open mobile menu
    const mobileMenuButton = screen.getAllByText('MenuIcon')[1];
    fireEvent.click(mobileMenuButton);

    // Logout via mobile menu
    const mobileLogoutButton = screen.getAllByText('Logout')[0].closest('button');
    fireEvent.click(mobileLogoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockResetNotes).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  //  User display with different user data
  test('displays user information correctly', () => {
    // Test with fullName
    const { rerender } = renderNavbar();
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Test with username only
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      logout: mockLogout,
    });

    rerender(
      <BrowserRouter>
        <Navbar onMenuToggle={mockOnMenuToggle} isSidebarOpen={false} />
      </BrowserRouter>
    );
    expect(screen.getByText('testuser')).toBeInTheDocument();

    // Test with no user data
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    rerender(
      <BrowserRouter>
        <Navbar onMenuToggle={mockOnMenuToggle} isSidebarOpen={false} />
      </BrowserRouter>
    );
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  //  Mobile search bar visibility
  test('shows mobile search bar only on mobile', () => {
    renderNavbar();

    // Mobile search bar should be visible (it's always rendered but hidden on desktop)
    const searchInputs = screen.getAllByPlaceholderText('Search notes...');
    expect(searchInputs).toHaveLength(2); // Desktop and mobile
    
    const mobileSearchContainer = searchInputs[1].closest('div').parentElement;
    expect(mobileSearchContainer).toHaveClass('md:hidden');
  });

  //  Desktop navigation visibility
  test('shows desktop navigation only on desktop', () => {
    renderNavbar();

    const desktopNav = screen.getByText('Home').closest('div');
    expect(desktopNav).toHaveClass('hidden');
    expect(desktopNav).toHaveClass('md:flex');
  });

  //  Search input synchronization with filters
  test('syncs search input with context filters', () => {
    mockUseNotes.mockReturnValue({
      updateFilters: mockUpdateFilters,
      filters: { search: 'existing search' },
      resetNotes: mockResetNotes,
    });

    renderNavbar();

    const searchInputs = screen.getAllByPlaceholderText('Search notes...');
    searchInputs.forEach(input => {
      expect(input).toHaveValue('existing search');
    });
  });

  //  Mobile menu closes on navigation
  test('closes mobile menu when navigating via mobile menu', () => {
    renderNavbar();

    // Open mobile menu
    const mobileMenuButton = screen.getAllByText('MenuIcon')[1];
    fireEvent.click(mobileMenuButton);

    // Navigate via mobile menu - should close menu
    const mobileArchiveButton = screen.getAllByText('Archive')[1];
    fireEvent.click(mobileArchiveButton);

    // Menu should be closed (X icon replaced with Menu icon)
    expect(screen.queryByText('XIcon')).not.toBeInTheDocument();
  });

});