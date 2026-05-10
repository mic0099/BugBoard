import { expect, jest } from '@jest/globals';

jest.unstable_mockModule("../models/Database.js", () => ({

  Issue: {},

  User: {
    findByPk: jest.fn()
  },

  Project: {},

  Comment: {},

  Tag: {},

  Image: {},

  database: {}

}));

const { projectController } = await import("../controller/projectController.js");

const { User } = await import("../models/Database.js");

test("should return all projects of user", async () => {

  const mockProjects = [
    {
      projectId: 1,
      name: "BugBoard"
    }
  ];

  const mockUser = {
    getProjects: jest.fn().mockResolvedValue(mockProjects)
  };

  User.findByPk.mockResolvedValue(mockUser);

  const req = {
    user: {
      userId: 1
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await projectController.getAllProjects(req, res, next);

  expect(User.findByPk).toHaveBeenCalledWith(1);

  expect(mockUser.getProjects).toHaveBeenCalled();

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(mockProjects);

  expect(next).not.toHaveBeenCalled();

}); 


test("should return 404 if user does not exist",async () => { 

   User.findByPk.mockResolvedValue(null); 

    const req = {
    user: {
      userId: 1
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn(); 

  await projectController.getAllProjects(req, res, next); 

  expect(res.status).toHaveBeenCalledWith(404); 

  expect(res.json).toHaveBeenCalledWith({message:"User not found"});  

  expect(next).not.toHaveBeenCalled();


}) 
