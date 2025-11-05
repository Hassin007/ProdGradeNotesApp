import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:9000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// SIMPLIFIED Response interceptor - Remove complex token refresh logic for now
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't log 401 errors for token refresh endpoint to avoid noise
    if (!originalRequest.url?.includes('/refresh-token')) {
      console.error('❌ Response Error:', error.response?.status, error.response?.data);
    }

    // Handle specific error cases
    if (error.response) {
      // Handle 401 - Unauthorized
      if (error.response.status === 401) {
        console.log('🔐 Unauthorized - Please login again');
        
        // Only redirect if not already on login page and not an auth endpoint
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/reset-password') &&
            !originalRequest.url?.includes('/users/login') &&
            !originalRequest.url?.includes('/users/register') &&
            !originalRequest.url?.includes('/forgot-password')) {
          console.log('🔄 Redirecting to login...');
          window.location.href = '/login';
        }
      }

      // Handle other status codes
      switch (error.response.status) {
        case 403:
          console.log('🚫 Forbidden - Access denied');
          break;
        case 404:
          console.log('🔍 Not found');
          break;
        case 500:
          console.log('💥 Server error');
          break;
        default:
          console.log('⚠️ Error:', error.response.data?.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.log('📡 No response from server - Check your connection');
    } else {
      // Something else happened
      console.log('❓ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ========================
// AUTH API CALLS
// ========================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    console.log('👤 Registering user:', userData.email);
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    console.log('🔐 Logging in user:', credentials.email);
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    console.log('🚪 Logging out user');
    const response = await api.post('/users/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    console.log('👤 Getting current user');
    const response = await api.get('/users/current-user');
    return response.data;
  },

  // Refresh access token
  refreshToken: async () => {
    console.log('🔄 Refreshing token');
    const response = await api.post('/users/refresh-token');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    console.log('📧 Forgot password for:', email);
    const response = await api.post('/users/forgot-password', { email });
    return response.data;
  },

  // Validate reset token
  validateResetToken: async (token) => {
    console.log('🔑 Validating reset token');
    const response = await api.post('/users/validate-reset-token', { token });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    console.log('🔄 Resetting password');
    const response = await api.post('/users/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  }
};

// ========================
// NOTES API CALLS
// ========================

export const notesAPI = {
  // Get all notes with optional filters
  getAllNotes: async (filters = {}) => {
    console.log('📝 Getting all notes with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.tags) params.append('tags', filters.tags);
    if (filters.isPinned !== undefined) params.append('isPinned', filters.isPinned);
    if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived);
    
    const response = await api.get(`/notes?${params.toString()}`);
    return response.data;
  },

  // Get single note by ID
  getNoteById: async (id) => {
    console.log('📄 Getting note by ID:', id);
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Create new note
  createNote: async (noteData) => {
    console.log('➕ Creating new note');
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  // Update note
  updateNote: async (id, noteData) => {
    console.log('✏️ Updating note:', id);
    const response = await api.patch(`/notes/${id}`, noteData);
    return response.data;
  },

  // Delete note
  deleteNote: async (id) => {
    console.log('🗑️ Deleting note:', id);
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  // Toggle pin status
  togglePin: async (id) => {
    console.log('📌 Toggling pin for note:', id);
    const response = await api.patch(`/notes/${id}/pin`);
    return response.data;
  },

  // Archive note
  archiveNote: async (id) => {
    console.log('📁 Archiving note:', id);
    const response = await api.patch(`/notes/${id}/archive`);
    return response.data;
  },

  // Unarchive note
  unarchiveNote: async (id) => {
    console.log('📂 Unarchiving note:', id);
    const response = await api.patch(`/notes/${id}/unarchive`);
    return response.data;
  },

  // Get all user tags
  getUserTags: async () => {
    console.log('🏷️ Getting user tags');
    const response = await api.get('/notes/tags/all');
    return response.data;
  },

  // Bulk delete notes
  bulkDelete: async (noteIds) => {
    console.log('🗑️ Bulk deleting notes:', noteIds);
    const response = await api.post('/notes/bulk-delete', { noteIds });
    return response.data;
  },
};

export default api;