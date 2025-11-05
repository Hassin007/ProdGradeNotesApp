import { jest } from "@jest/globals";

const mockUser = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};
jest.unstable_mockModule("../src/models/user.model.js", () => ({
  User: mockUser,
}));

const mockUpload = jest.fn();
jest.unstable_mockModule("../src/utils/Cloudinary.js", () => ({
  uploadOnCloudinary: mockUpload,
}));

const { registerUser } = await import("../src/controllers/user.controller.js");

let req, res;

beforeEach(() => {
  req = {
    body: {},
    file: null,
    method: "POST",
    originalUrl: "/api/v1/users/register",
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  jest.clearAllMocks();
});

describe("registerUser Handler", () => {
  test("should return 409 if user with email or username already exists", async () => {
    req.body = {
      fullName: "John Doe",
      email: "john@example.com",
      username: "john",
      password: "pass1234@",
    };

    mockUser.findOne.mockResolvedValue({ _id: "existingId" });

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "User with email or username already exists",
      })
    );
  });

  test("should successfully register user without avatar", async () => {
  req.body = {
    fullName: "John Doe",
    email: "john@example.com",
    username: "john",
    password: "pass1234@",
  };

  mockUser.findOne.mockResolvedValue(null);

  const created = { _id: "newId" };
  mockUser.create.mockResolvedValue(created);

  const foundUser = {
    _id: "newId",
    fullName: "John Doe",
    email: "john@example.com",
    username: "john",
  };

  // Mock .findById().select() chain
  mockUser.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(foundUser),
  });

  await registerUser(req, res);

  expect(mockUser.create).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ email: "john@example.com" }),
    })
  );
})})
