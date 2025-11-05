export const authAPI = {
  getCurrentUser: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
};

export const notesAPI = {
  getAllNotes: jest.fn(),
  getUserTags: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  togglePin: jest.fn(),
  archiveNote: jest.fn(),
  unarchiveNote: jest.fn(),
  bulkDelete: jest.fn(),
};

export default {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: { response: { use: jest.fn() } },
};