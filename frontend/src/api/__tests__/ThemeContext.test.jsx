import { jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

// Create proper localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia - default to light theme
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to light theme
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

describe('ThemeContext React Tests', () => {
  beforeEach(() => {
    // Clear the store and mocks
    localStorage.clear();
    jest.clearAllMocks();
    document.documentElement.classList.remove('dark');
    
    // Reset matchMedia to light theme
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test('should provide theme context with initial values', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(false);
    expect(typeof result.current.toggleTheme).toBe('function');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('toggleTheme should switch from light to dark mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial render to complete
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Toggle to dark
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Check that setItem was called with dark theme (could be called multiple times due to initialization)
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  test('toggleTheme should switch from dark to light mode', () => {
    // Start with dark mode in localStorage
    localStorage.setItem('theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    // Initial state should be dark
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle to light
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  test('should initialize with saved theme from localStorage', () => {
    // Set dark theme in localStorage
    localStorage.setItem('theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem).toHaveBeenCalledWith('theme');
  });

  test('should initialize with light theme when no saved preference', () => {
    // Clear localStorage
    localStorage.clear();

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem).toHaveBeenCalledWith('theme');
  });

  test('multiple toggle calls should work correctly', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Get initial call count
    const initialCallCount = localStorage.setItem.mock.calls.length;

    // Toggle multiple times
    act(() => {
      result.current.toggleTheme(); // light -> dark
    });
    expect(result.current.isDark).toBe(true);

    act(() => {
      result.current.toggleTheme(); // dark -> light
    });
    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme(); // light -> dark
    });
    expect(result.current.isDark).toBe(true);

    // Should be called 3 more times for our 3 toggles
    expect(localStorage.setItem).toHaveBeenCalledTimes(initialCallCount + 3);
    
    // Check the last 3 calls (our toggles)
    const allCalls = localStorage.setItem.mock.calls;
    expect(allCalls[initialCallCount]).toEqual(['theme', 'dark']);
    expect(allCalls[initialCallCount + 1]).toEqual(['theme', 'light']);
    expect(allCalls[initialCallCount + 2]).toEqual(['theme', 'dark']);
  });

  test('should handle system preference for dark mode', () => {
    // Mock system preference as dark
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true, // dark theme
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('should prioritize localStorage over system preference', () => {
    // Mock system preference as dark but localStorage as light
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: true, // system prefers dark
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    localStorage.setItem('theme', 'light');

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDark).toBe(false); // Should use localStorage preference
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('should save theme to localStorage on toggle', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    // Wait for initial state to be set
    expect(result.current.isDark).toBe(false);

    // Get the current call count after initialization
    const callsAfterInit = localStorage.setItem.mock.calls.length;

    // Toggle to dark and verify localStorage call
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledTimes(callsAfterInit + 1);
    expect(localStorage.setItem).toHaveBeenLastCalledWith('theme', 'dark');

    // Toggle back to light and verify localStorage call
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDark).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledTimes(callsAfterInit + 2);
    expect(localStorage.setItem).toHaveBeenLastCalledWith('theme', 'light');
  });

  test('initial theme should be based on localStorage then system preference', () => {
    // Test with no localStorage and system prefers light
    localStorage.clear();
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(false);
  });
});