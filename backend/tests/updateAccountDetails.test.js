import { jest } from "@jest/globals";

const mockUser = {
  findByIdAndUpdate: jest.fn(),
};
jest.unstable_mockModule("../src/models/user.model.js", () => ({
  User: mockUser,
}));


const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
jest.unstable_mockModule("../src/utils/logger.js", () => ({
  default: mockLogger,
}));

const { updateAccountDetails } = await import("../src/controllers/user.controller.js");

let req, res;

beforeEach(() => {
  req = {
    body: {},
    user: { _id: "12345" },
    method: "PUT",
    originalUrl: "/api/v1/users/update-account",
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  jest.clearAllMocks();
});

describe("updateAccountDetails Handler", () => {
  test("should return 400 if fullName or email is missing", async () => {
    req.body = { fullName: "" }; // missing email

    await updateAccountDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "All fields are required",
      })
    );
  });

  test("should return 404 if user not found", async () => {
    req.body = { fullName: "John Doe", email: "john@example.com" };

    // Properly mock chained select() returning null
    mockUser.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await updateAccountDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User not found",
      })
    );
  });

  test("should successfully update account details", async () => {
    req.body = { fullName: "John Doe", email: "john@example.com" };

    mockUser.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "123",
        fullName: "John Doe",
        email: "john@example.com",
      }),
    });

    await updateAccountDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "john@example.com",
        }),
        message: "Account details updated successfully",
      })
    );
  });
});
