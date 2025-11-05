import { jest } from "@jest/globals";

const mockUser = {
  findById: jest.fn(),
};
jest.unstable_mockModule("../src/models/user.model.js", () => ({
  User: mockUser,
}));

// Import controller AFTER mocks
const { changeCurrentPassword } = await import("../src/controllers/user.controller.js");

let req, res;

beforeEach(() => {
  req = {
    body: {},
    user: { _id: "user123" },
    method: "POST",
    originalUrl: "/api/v1/users/change-password",
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  jest.clearAllMocks();
});

// -------- TESTS --------
describe("changeCurrentPassword Handler", () => {
  test("should return 400 if new password is missing", async () => {
    req.body = { oldPassword: "oldpass@" };

    await changeCurrentPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "New password field can't be empty",
      })
    );
  });

  test("should return 400 if old and new passwords are the same", async () => {
    req.body = { oldPassword: "samepass@", newPassword: "samepass@" };

    await changeCurrentPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "New password must be different from old password",
      })
    );
  });

  test("should return 404 if user not found", async () => {
    req.body = { oldPassword: "oldpass@", newPassword: "newpass@" };
    mockUser.findById.mockResolvedValue(null);

    await changeCurrentPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User not found",
      })
    );
  });

  test("should return 400 if old password is invalid", async () => {
    req.body = { oldPassword: "wrongpass", newPassword: "newpass" };
    const fakeUser = {
      isPasswordCorrect: jest.fn().mockResolvedValue(false),
    };
    mockUser.findById.mockResolvedValue(fakeUser);

    await changeCurrentPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid old password",
      })
    );
  });

  test("should successfully change password", async () => {
    req.body = { oldPassword: "oldpass@", newPassword: "newpass@" };
    const fakeUser = {
      isPasswordCorrect: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
    };
    mockUser.findById.mockResolvedValue(fakeUser);

    await changeCurrentPassword(req, res);

    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Password changed successfully",
      })
    );
  });
});
