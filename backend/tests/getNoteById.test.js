import { jest } from "@jest/globals";


const mockLogger = {
  debug: jest.fn(),
  warn: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));


const mockFindOne = jest.fn();
jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: { findOne: mockFindOne },
}));


const { getNoteById } = await import("../src/controllers/notes.controller.js");

describe("getNoteById Handler", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      params: { id: "note123" },
      method: "GET",
      originalUrl: "/api/v1/notes/note123",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("should return 404 if note not found", async () => {
    mockFindOne.mockResolvedValue(null);

    await getNoteById(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: "note123", user: "user123" });
    expect(mockLogger.warn).toHaveBeenCalledWith("Note not found", {
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

  test("should return 200 and the note if found", async () => {
    const fakeNote = {
      _id: "note123",
      title: "My Note",
      content: "This is a test note",
    };
    mockFindOne.mockResolvedValue(fakeNote);

    await getNoteById(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: "note123", user: "user123" });
    expect(mockLogger.debug).toHaveBeenCalledWith("Note retrieved", {
      userId: "user123",
      noteId: "note123",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: fakeNote,
      })
    );
  });
});
