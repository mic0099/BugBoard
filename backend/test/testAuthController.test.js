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

test("should call next with error 400 if password is missing", async () => {

  const req = {
    body: {
      name: "michele",
      surname: "loreto",
      email: "test@test.com",
      admin: true
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();

  expect(next.mock.calls[0][0].message)
    .toBe("missing parameter password is required");

  expect(next.mock.calls[0][0].status)
    .toBe(400);

});

test("should call next with error 400 if admin is missing", async () => {

  const req = {
    body: {
      name: "michele",
      surname: "loreto",
      email: "test@test.com",
      password:"Test0099*"
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await authController.creaUser(req, res, next);

  expect(User.create).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();

  expect(next.mock.calls[0][0].message)
    .toBe("missing parameter admin is required");

  expect(next.mock.calls[0][0].status)
    .toBe(400);

});



test("should create user successfully",async () => { 

  const req = { 
    body: {
      name: "admin",
      surname: "test",
      email: "test@test.com", 
      password:"Test0099*", 
      admin: true
    }
  };

  const res = { 
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn(); 

  User.create.mockResolvedValue({
    id: 1,
    name: "michele",
    surname: "loreto",
    email: "test@test.com",
    admin: true
  });  

  await authController.creaUser(req,res,next);  

  expect(User.create).toHaveBeenCalledWith({ 
      name: "michele",
      surname: "loreto",
      email: "test@test.com", 
      password:"Test0099*", 
      admin: true    
  }); 

  expect(res.status).toHaveBeenCalledWith(201); 

  expect(res.json).toHaveBeenCalledWith({ 
  id: 1,
  name: "michele",
  surname: "loreto",
  email: "test@test.com",
  admin: true
  }); 

  expect(next).not.toHaveBeenCalled(); 


});  