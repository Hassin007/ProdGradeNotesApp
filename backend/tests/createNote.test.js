import { jest } from "@jest/globals";

// Mock Note model
const mockNote = {
  create: jest.fn(),
};
jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: mockNote,
}));

// Mock logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));

// Import controller AFTER mocks
const { createNote } = await import("../src/controllers/notes.controller.js");

let req, res;

beforeEach(() => {
  req = {
    body: {},
    user: { _id: "user123" },
    method: "POST",
    originalUrl: "/api/v1/notes",
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  jest.clearAllMocks();
});

describe("createNote Handler", () => {
  test("should return 400 if title is missing", async () => {
    req.body = { content: "Note without title" };

    await createNote(req, res);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Attempt to create note without title",
      { userId: "user123" }
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Title is required",
      })
    );
  });

  test("should successfully create a note with minimal fields", async () => {
    req.body = { title: "My first note" };

    const newNote = {
      _id: "note123",
      title: "My first note",
      content: "",
      tags: [],
      user: "user123",
      isPinned: false,
    };

    mockNote.create.mockResolvedValue(newNote);

    await createNote(req, res);

    expect(mockNote.create).toHaveBeenCalledWith({
      title: "My first note",
      content: "",
      tags: [],
      user: "user123",
      isPinned: false,
    });

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Note created successfully",
      expect.objectContaining({ userId: "user123", noteId: "note123" })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Note created successfully",
        data: newNote,
      })
    );
  });

  test("should successfully create a note with all fields", async () => {
    req.body = {
      title: "Meeting Notes",
      content: "Discuss project timeline",
      tags: ["work", "project"],
      isPinned: true,
    };

    const createdNote = {
      _id: "note456",
      ...req.body,
      user: "user123",
    };

    mockNote.create.mockResolvedValue(createdNote);

    await createNote(req, res);

    expect(mockNote.create).toHaveBeenCalledWith({
      title: "Meeting Notes",
      content: "Discuss project timeline",
      tags: ["work", "project"],
      user: "user123",
      isPinned: true,
    });

    expect(mockLogger.info).toHaveBeenCalledWith(
      "Note created successfully",
      expect.objectContaining({ userId: "user123", noteId: "note456" })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Note created successfully",
        data: createdNote,
      })
    );
  });
});
