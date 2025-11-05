import { jest } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

// Mock react-hot-toast first
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock the API module with the exact same import path
jest.mock('../../services/api', () => ({
  authAPI: {
    getCurrentUser: jest.fn(() => Promise.resolve({ success: false })),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
  notesAPI: {
    getAllNotes: jest.fn(),
    getUserTags: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    togglePin: jest.fn(),
    archiveNote: jest.fn(),
    unarchiveNote: jest.fn(),
    bulkDelete: jest.fn(),
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
import { authAPI } from '../../services/api';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext React Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should provide auth context with initial values', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.register).toBe('function');
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  test('should set user after successful authentication check', async () => {
    const mockUser = { _id: '1', name: 'Test User', email: 'test@test.com' };
    authAPI.getCurrentUser.mockResolvedValue({
      success: true,
      data: mockUser
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(authAPI.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});