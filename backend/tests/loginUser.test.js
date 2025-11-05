import { jest } from "@jest/globals";


const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
jest.unstable_mockModule("../src/models/user.model.js", () => ({
  User: mockUser,
}));

const mockGenerateTokens = jest.fn();
jest.unstable_mockModule("../src/utils/generateTokens.js", () => ({
  generateAccessAndRefereshTokens: mockGenerateTokens,
}));

const { loginUser } = await import("../src/controllers/user.controller.js");


let req, res;

beforeEach(() => {
  req = {
    body: {},
    method: "POST",
    originalUrl: "/api/v1/users/login",
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    cookie: jest.fn().mockReturnThis(),
  };
  jest.clearAllMocks();
});

// --------------- TESTS -----------------
describe("loginUser Handler", () => {
  test("should return 400 if username and email are missing", async () => {
    req.body = { password: "password123" };

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "username or email is required",
      })
    );
  });

  test("should return 404 if user does not exist", async () => {
    req.body = { email: "test@example.com", password: "pass1234@" };
    mockUser.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User does not exist",
      })
    );
  });

  test("should return 401 if password is invalid", async () => {
    req.body = { email: "john@example.com", password: "wrongpass" };
    const fakeUser = {
      _id: "123",
      username: "john",
      isPasswordCorrect: jest.fn().mockResolvedValue(false),
    };
    mockUser.findOne.mockResolvedValue(fakeUser);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Invalid user credentials",
      })
    );
  });

  test("should successfully login user (without checking tokens)", async () => {
    req.body = { email: "john@example.com", password: "pass1234@" };

    const fakeUser = {
      _id: "123",
      username: "john",
      isPasswordCorrect: jest.fn().mockResolvedValue(true),
    };

    mockUser.findOne.mockResolvedValue(fakeUser);
    mockUser.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "123",
        email: "john@example.com",
        username: "john",
      }),
    });

    mockGenerateTokens.mockResolvedValue({
      accessToken: "access123",
      refreshToken: "refresh123",
    });

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringMatching(/logged in/i),
      })
    );
  });
});
