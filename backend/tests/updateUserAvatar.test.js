import { jest } from "@jest/globals";

// Mock the User model
const mockUser = {
  findByIdAndUpdate: jest.fn(),
};
jest.unstable_mockModule("../src/models/user.model.js", () => ({
  User: mockUser,
}));

// Mock Cloudinary uploader
const mockUpload = jest.fn();
jest.unstable_mockModule("../src/utils/Cloudinary.js", () => ({
  uploadOnCloudinary: mockUpload,
}));

// Mock logger (if your controller imports it)
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));

// Import AFTER mocks
const { updateUserAvatar } = await import("../src/controllers/user.controller.js");

let req, res;

beforeEach(() => {
  req = {
    user: { _id: "123" },
    file: null,
    method: "PATCH",
    originalUrl: "/api/v1/users/avatar",
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

describe("updateUserAvatar Handler", () => {
  test("should return 400 if avatar file is missing", async () => {
    req.file = null;

    await updateUserAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Avatar file is missing",
      })
    );
  });

  test("should return 400 if upload fails (no URL returned)", async () => {
    req.file = { path: "uploads/avatar.png" };

    mockUpload.mockResolvedValue({}); 

    await updateUserAvatar(req, res);

    expect(mockUpload).toHaveBeenCalledWith("uploads/avatar.png");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Error while uploading on avatar",
      })
    );
  });

  test("should successfully update avatar", async () => {
    req.file = { path: "uploads/avatar.png" };

    mockUpload.mockResolvedValue({ url: "https://cdn.com/avatar.png" });

    mockUser.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "123",
        avatar: "https://cdn.com/avatar.png",
      }),
    });

    await updateUserAvatar(req, res);

    expect(mockUpload).toHaveBeenCalledWith("uploads/avatar.png");
    expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
      "123",
      { $set: { avatar: "https://cdn.com/avatar.png" } },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          avatar: "https://cdn.com/avatar.png",
        }),
        message: "Avatar image updated successfully",
      })
    );
  });
});
