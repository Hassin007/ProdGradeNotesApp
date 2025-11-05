import { jest } from "@jest/globals";


const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));


const mockFindOne = jest.fn();
jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: { findOne: mockFindOne },
}));


const { updateNote } = await import("../src/controllers/notes.controller.js");

describe("updateNote Handler", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      params: { id: "note123" },
      body: {},
      method: "PUT",
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

    await updateNote(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ _id: "note123", user: "user123" });
    expect(mockLogger.warn).toHaveBeenCalledWith("Attempt to update non-existent note", {
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

  test("should successfully update a note", async () => {
    const fakeNote = {
      _id: "note123",
      title: "Old Title",
      content: "Old content",
      tags: ["old"],
      isPinned: false,
      save: jest.fn().mockResolvedValue(true),
    };

    mockFindOne.mockResolvedValue(fakeNote);

    req.body = {
      title: "New Title",
      content: "New content",
      tags: ["updated"],
      isPinned: true,
    };

    await updateNote(req, res);

    expect(fakeNote.title).toBe("New Title");
    expect(fakeNote.content).toBe("New content");
    expect(fakeNote.tags).toEqual(["updated"]);
    expect(fakeNote.isPinned).toBe(true);
    expect(fakeNote.save).toHaveBeenCalled();

    expect(mockLogger.info).toHaveBeenCalledWith("Note updated successfully", {
      userId: "user123",
      noteId: "note123",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Note updated successfully",
        data: fakeNote,
      })
    );
  });
});
