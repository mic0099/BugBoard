import { expect, jest } from '@jest/globals'; 

beforeEach(() => {
  jest.clearAllMocks();
});

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

// TC1: utente trovato, con progetti (successo)
test("should return all projects of user", async () => {
  const mockProjects = [
    { projectId: 1, name: "BugBoard" }
  ];

  const mockUser = {
    getProjects: jest.fn().mockResolvedValue(mockProjects)
  };

  User.findByPk.mockResolvedValue(mockUser);

  const req = {
    user: { userId: 1 }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await projectController.getAllProjects(req, res, next);

  expect(User.findByPk).toHaveBeenCalledWith(1);
  expect(mockUser.getProjects).toHaveBeenCalledTimes(1);

  const callArgs = mockUser.getProjects.mock.calls[0][0];

  expect(callArgs.group).toEqual([
    'Project.projectId',
    'Project.name',
    'Project.createdAt',
    'Users.userId',
    'Users.email',
    'Users.name',
    'Users.surname',
    'UserProjects.userId',
    'UserProjects.projectId',
    'UserProjects.createdAt',
    'UserProjects.updatedAt'
  ]);

  expect(callArgs.order).toEqual([['name', 'ASC']]);
  expect(callArgs.subQuery).toBe(false);

  
  expect(callArgs.include).toHaveLength(2);
  expect(callArgs.include[0]).toMatchObject({
    attributes: [],
    required: false
  });
  expect(callArgs.include[1]).toMatchObject({
    attributes: ['email', 'name', 'surname'],
    through: { attributes: [] },
    required: false
  });

  expect(callArgs.attributes[0]).toBe('projectId');
  expect(callArgs.attributes[1]).toBe('name');
  expect(callArgs.attributes[2]).toBe('createdAt');
  expect(callArgs.attributes).toHaveLength(4);
  expect(callArgs.attributes[3][1]).toBe('issuesCount'); 

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(mockProjects);
  expect(next).not.toHaveBeenCalled();
});

// TC2: utente non trovato
test("should return 404 if user does not exist", async () => { 
  User.findByPk.mockResolvedValue(null); 

  const req = {
    user: { userId: 1 }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn(); 

  await projectController.getAllProjects(req, res, next); 

  expect(User.findByPk).toHaveBeenCalledWith(1);

  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("User not found");
  expect(next.mock.calls[0][0].status).toBe(404);

  
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();
});

// TC3: utente trovato, ma nessun progetto associato
test("should return 200 with empty array when user has no projects", async () => {
  const mockUser = {
    getProjects: jest.fn().mockResolvedValue([])
  };

  User.findByPk.mockResolvedValue(mockUser);

  const req = {
    user: { userId: 1 }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await projectController.getAllProjects(req, res, next);

  expect(mockUser.getProjects).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([]);
  expect(next).not.toHaveBeenCalled();
});



// TC4 (Eccezione): req.user assente/malformato (TypeError catturato dal catch generico)
test("calls next with error when req.user is missing", async () => {
  const req = {};

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await projectController.getAllProjects(req, res, next);

  expect(User.findByPk).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0]).toBeInstanceOf(TypeError);
});