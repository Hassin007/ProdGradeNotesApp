import { jest } from "@jest/globals";


const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));


const mockFindOneAndDelete = jest.fn();
jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: { findOneAndDelete: mockFindOneAndDelete },
}));


const { deleteNote } = await import("../src/controllers/notes.controller.js");

describe("deleteNote Handler", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      params: { id: "note123" },
      method: "DELETE",
      originalUrl: "/api/v1/notes/note123",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("should return 404 if note not found", async () => {
    mockFindOneAndDelete.mockResolvedValue(null);

    await deleteNote(req, res);

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: "note123",
      user: "user123",
    });
    expect(mockLogger.warn).toHaveBeenCalledWith("Attempt to delete non-existent note", {
      userId: "user123",
      noteId: "note123",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Note not found",
      })
    );
  });

  test("should successfully delete a note", async () => {
    const fakeDeletedNote = { _id: "note123", title: "To be deleted" };
    mockFindOneAndDelete.mockResolvedValue(fakeDeletedNote);

    await deleteNote(req, res);

    expect(mockFindOneAndDelete).toHaveBeenCalledWith({
      _id: "note123",
      user: "user123",
    });
    expect(mockLogger.info).toHaveBeenCalledWith("Note deleted", {
      userId: "user123",
      noteId: "note123",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Note deleted successfully",
      })
    );
  });
});