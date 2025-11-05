import { jest } from "@jest/globals";


const mockLogger = {
  debug: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));


const mockNotes = [
  {
    _id: "1",
    title: "Note 1",
    content: "This is note 1",
    tags: ["work"],
    isPinned: false,
    isArchived: false,
    updatedAt: new Date(),
  },
  {
    _id: "2",
    title: "Note 2",
    content: "Pinned note",
    tags: ["personal"],
    isPinned: true,
    isArchived: false,
    updatedAt: new Date(),
  },
];

const mockSort = jest.fn().mockResolvedValue(mockNotes);
const mockFind = jest.fn(() => ({ sort: mockSort }));

jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: { find: mockFind },
}));


const { getAllNotes } = await import("../src/controllers/notes.controller.js");

describe("getAllNotes Handler", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { _id: "user123" },
      query: {},
      method: "GET",
      originalUrl: "/api/v1/notes",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("should fetch all non-archived notes for a user", async () => {
    await getAllNotes(req, res);

    expect(mockFind).toHaveBeenCalledWith({
      user: "user123",
      isArchived: false,
    });
    expect(mockSort).toHaveBeenCalledWith({ isPinned: -1, updatedAt: -1 });
    expect(mockLogger.debug).toHaveBeenCalledWith("Fetched notes", {
      userId: "user123",
      count: mockNotes.length,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: mockNotes.length,
        data: mockNotes,
      })
    );
  });

  test("should filter by pinned status", async () => {
    req.query.isPinned = "true";

    await getAllNotes(req, res);

    expect(mockFind).toHaveBeenCalledWith({
      user: "user123",
      isArchived: false,
      isPinned: true,
    });
  });

  test("should filter by archived status", async () => {
    req.query.isArchived = "true";

    await getAllNotes(req, res);

    expect(mockFind).toHaveBeenCalledWith({
      user: "user123",
      isArchived: true,
    });
  });

  test("should apply search filter", async () => {
    req.query.search = "note";

    await getAllNotes(req, res);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { title: { $regex: "note", $options: "i" } },
          { content: { $regex: "note", $options: "i" } },
        ],
      })
    );
  });

  test("should filter by tags", async () => {
    req.query.tags = "work,personal";

    await getAllNotes(req, res);

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: { $in: ["work", "personal"] },
      })
    );
  });
});