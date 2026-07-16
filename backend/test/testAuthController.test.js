import { expect, jest, test } from '@jest/globals';

beforeEach(() => {
  jest.clearAllMocks();
});

jest.unstable_mockModule("../models/Database.js", () => ({
  User: {
    create: jest.fn()
  },
  RefreshToken: {},
  Comment: {},
  Tag: {},
  Issue: {},
  Project: {},
  Image: {}
}));

const { authController } = await import("../controller/authController.js");
const { User } = await import("../models/Database.js");


// TC1: tutti i parametri validi con admin=true(successo)
test("should create user successfully", async () => {
  const req = {
    body: {
      name: "test",
      surname: "test",
      email: "test@test.com",
      password: "Test0099*",
      admin: true
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  User.create.mockResolvedValue({
    id: 1,
    name: "test",
    surname: "test",
    email: "test@test.com",
    admin: true
  });

  await authController.creaUser(req, res, next);

  expect(User.create).toHaveBeenCalledWith({
    email: "test@test.com",
    name: "test",
    surname: "test",
    password: "Test0099*",
    admin: true
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    id: 1,
    name: "test",
    surname: "test",
    email: "test@test.com",
    admin: true
  });
  expect(next).not.toHaveBeenCalled();
});



// TC2: Tutti i parametri validi con admin = false -> successo 
test("should create user successfully when admin is false", async () => {
  const req = {
    body: {
      name: "test",
      surname: "test",
      email: "test@test.com",
      password: "Test0099*",
      admin: false
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  User.create.mockResolvedValue({
    id: 2,
    name: "test",
    surname: "test",
    email: "test@test.com",
    admin: false
  });

  await authController.creaUser(req, res, next);

  expect(User.create).toHaveBeenCalledWith({
    email: "test@test.com",
    name: "test",
    surname: "test",
    password: "Test0099*",
    admin: false
  });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(next).not.toHaveBeenCalled();
});

// TC3: email mancante
test("should call next with error 400 if email is missing", async () => {
  const req = {
    body: {
      name: "test",
      surname: "test",
      password: "Test0099*",
      admin: true
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing parameter email is required");
  expect(next.mock.calls[0][0].status).toBe(400);
});

// TC4: name mancante
test("should call next with error 400 if name is missing", async () => {
  const req = {
    body: {
      email: "test@test.com",
      surname: "test",
      password: "Test0099*",
      admin: true
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing parameter name is required");
  expect(next.mock.calls[0][0].status).toBe(400);
});

// TC5: surname mancante
test("should call next with error 400 if surname is missing", async () => {
  const req = {
    body: {
      email: "test@test.com",
      name: "test",
      password: "Test0099*",
      admin: true
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing parameter surname is required");
  expect(next.mock.calls[0][0].status).toBe(400);
});

// TC6: password mancante 
test("should call next with error 400 if password is missing", async () => {
  const req = {
    body: {
      name: "test",
      surname: "test",
      email: "test@test.com",
      admin: true
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing parameter password is required");
  expect(next.mock.calls[0][0].status).toBe(400);
});

// TC7: admin mancante 
test("should call next with error 400 if admin is missing", async () => {
  const req = {
    body: {
      name: "test",
      surname: "test",
      email: "test@test.com",
      password: "Test0099*"
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing parameter admin is required");
  expect(next.mock.calls[0][0].status).toBe(400);
});



// TC8: più parametri mancanti 
test("should stop at first missing parameter (email) when multiple are missing", async () => {
  const req = {
    body: {
      surname: "test",
      password: "Test0099*",
      admin: true
    } // email e name mancanti
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing parameter email is required");
  expect(next.mock.calls[0][0].status).toBe(400);
});


// TC9: email già esistente -> User.create rigetta la Promise
test("should call next with error when email already exists", async () => {
  const req = {
    body: {
      name: "test",
      surname: "test",
      email: "test@test.com",
      password: "Test0099*",
      admin: true
    }
  };
  const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  const next = jest.fn();

  const duplicateError = new Error("email must be unique");
  User.create.mockRejectedValue(duplicateError);

  await authController.creaUser(req, res, next);

  expect(next).toHaveBeenCalledWith(duplicateError);
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});

