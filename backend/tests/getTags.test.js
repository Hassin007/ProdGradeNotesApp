import { jest } from "@jest/globals";


const mockLogger = { debug: jest.fn() };
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));

const mockDistinct = jest.fn();
jest.unstable_mockModule("../src/models/note.model.js", () => ({
  Note: { distinct: mockDistinct },
}));


const { getUserTags } = await import("../src/controllers/notes.controller.js");


describe("getUserTags", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { _id: "user123" },
      method: "GET",
      originalUrl: "/api/v1/notes/tags",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("returns empty list when user has no tags", async () => {
    mockDistinct.mockResolvedValue([]);

    await getUserTags(req, res);

    expect(mockDistinct).toHaveBeenCalledWith("tags", {
      user: "user123",
      isArchived: false,
    });
    expect(mockLogger.debug).toHaveBeenCalledWith("Fetched user tags", {
      userId: "user123",
      tagCount: 0,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 0,
      data: [],
    });
  });

  it("returns distinct tags for active notes", async () => {
    const tags = ["work", "personal", "urgent"];
    mockDistinct.mockResolvedValue(tags);

    await getUserTags(req, res);

    expect(mockDistinct).toHaveBeenCalledWith("tags", {
      user: "user123",
      isArchived: false,
    });
    expect(mockLogger.debug).toHaveBeenCalledWith("Fetched user tags", {
      userId: "user123",
      tagCount: 3,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 3,
      data: tags,
    });
  });
});