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



test("should create user successfully",async () => { 

  const req = { //mock di req da passare al metodo da testare 
    body: {
      name: "michele",
      surname: "loreto",
      email: "test@test.com", 
      password:"Test0099*", 
      admin: true
    }
  };

  const res = { //mock di res da passare al metodo da testare
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn(); //mock di next da passare al metodo da testare 

  User.create.mockResolvedValue({
    id: 1,
    name: "michele",
    surname: "loreto",
    email: "test@test.com",
    admin: true
  });  

  await authController.creaUser(req,res,next); //chiamo il metodo e passo i parametri 

  expect(User.create).toHaveBeenCalledWith({ //verifico che viene effettuta chiamata a create per creazione elemento nel db 
      name: "michele",
      surname: "loreto",
      email: "test@test.com", 
      password:"Test0099*", 
      admin: true    
  }); 

  expect(res.status).toHaveBeenCalledWith(201); //verifico che viene chiamato metodo status  

  expect(res.json).toHaveBeenCalledWith({ //verifico che viene chiamato metodo json
  id: 1,
  name: "michele",
  surname: "loreto",
  email: "test@test.com",
  admin: true
  }); 

  expect(next).not.toHaveBeenCalled(); 


});  