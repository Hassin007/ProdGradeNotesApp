import { jest } from "@jest/globals";


const mockLogger = { info: jest.fn(), warn: jest.fn() };
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));

const mockFindOne = jest.fn();
jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: { findOne: mockFindOne },
}));


const { unarchiveNote } = await import("../src/controllers/notes.controller.js");


describe("unarchiveNote", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { _id: "user123" },
      params: { id: "note123" },
      method: "PATCH",
      originalUrl: "/api/v1/notes/note123/unarchive",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("404 when note not found", async () => {
    mockFindOne.mockResolvedValue(null);

    await unarchiveNote(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: "note123", user: "user123" });
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Attempt to unarchive non-existent note",
      { userId: "user123", noteId: "note123" }
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Note not found",
    });
  });

  it("unarchives note successfully", async () => {
    const note = {
      _id: "note123",
      isArchived: true,
      save: jest.fn().mockResolvedValue(true),
    };
    mockFindOne.mockResolvedValue(note);

    await unarchiveNote(req, res);

    expect(note.isArchived).toBe(false);
    expect(note.save).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith("Note unarchived", {
      userId: "user123",
      noteId: "note123",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Note unarchived successfully",
      data: note,
    });
  });
});