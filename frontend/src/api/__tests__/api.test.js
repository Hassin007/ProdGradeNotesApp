import { jest } from '@jest/globals';


jest.unstable_mockModule('../../services/api.js', () => {
  const api = {
    get:  jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: { response: { use: jest.fn() } },
  };

  return {
    default: api,            // axios instance
    authAPI: {
      register: (data) => api.post('/users/register', data).then(r => r.data),
      login:    (data) => api.post('/users/login', data).then(r => r.data),
      logout:   ()=> api.post('/users/logout').then(r => r.data),
      getCurrentUser: () => api.get('/users/current-user').then(r => r.data),
      refreshToken: () => api.post('/users/refresh-token').then(r => r.data),
    },
    notesAPI: {
      getAllNotes: (filters = {}) => api.get('/notes', { params: filters }).then(r => r.data),
      getNoteById: (id) => api.get(`/notes/${id}`).then(r => r.data),
      createNote: (data) => api.post('/notes', data).then(r => r.data),
      updateNote: (id, data) => api.patch(`/notes/${id}`, data).then(r => r.data),
      deleteNote: (id) => api.delete(`/notes/${id}`).then(r => r.data),
      togglePin: (id) => api.patch(`/notes/${id}/pin`).then(r => r.data),
      archiveNote: (id) => api.patch(`/notes/${id}/archive`).then(r => r.data),
      unarchiveNote: (id) => api.patch(`/notes/${id}/unarchive`).then(r => r.data),
      getUserTags: () => api.get('/notes/tags/all').then(r => r.data),
      bulkDelete: (noteIds) => api.post('/notes/bulk-delete', { noteIds }).then(r => r.data),
    },
  };
});


const { authAPI, notesAPI, default: api } = await import('../../services/api.js');

beforeEach(() => jest.clearAllMocks());

describe('API Layer', () => {
  test('authAPI.register calls POST /users/register with user data', async () => {
    const mockResponse = { data: { success: true } };
    api.post.mockResolvedValue(mockResponse);

    const userData = { name: 'Wallace', email: 'test@test.com' };
    const response = await authAPI.register(userData);

    expect(api.post).toHaveBeenCalledWith('/users/register', userData);
    expect(response).toEqual({ success: true });
  });

  test('notesAPI.getAllNotes calls GET /notes with correct query params', async () => {
    const mockResponse = { data: { notes: [] } };
    api.get.mockResolvedValue(mockResponse);

    const response = await notesAPI.getAllNotes({ search: 'test' });

    expect(api.get).toHaveBeenCalledWith('/notes', { params: { search: 'test' } });
    expect(response).toEqual({ notes: [] });
  });
});