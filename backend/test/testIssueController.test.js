import { expect, jest, test } from '@jest/globals';

beforeEach(() => {
  jest.clearAllMocks();
});

const mockGetIssues = jest.fn();

jest.unstable_mockModule('../models/Database.js', () => ({
  Issue: {},
  User: {},
  Project: {},
  Comment: {},
  Tag: {
    findOne: jest.fn()
  },
  Image: {},
  database: {}
}));

const { Tag } = await import('../models/Database.js');
const { issueController } = await import('../controller/issueController.js');


// TC1: content + projectId validi, tag e issue trovati
test("findIssueByTag returns issues correctly", async () => {
  const req = {
    query: {
      content: "bug",
      projectId: 3
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  const Issues = [
    { title: "issue test" }
  ];

  mockGetIssues.mockResolvedValue(Issues);

  Tag.findOne.mockResolvedValue({
    getIssues: mockGetIssues
  });

  await issueController.findIssueByTag(req, res, next);

  expect(Tag.findOne).toHaveBeenCalledWith({
    where: { content: "bug" }
  });

  expect(mockGetIssues).toHaveBeenCalledWith({
    where: { projectId: 3 },
    include: [
      { model: expect.anything(), attributes: ['name', 'surname'] },
      { model: expect.anything(), attributes: ['name'] },
      { model: expect.anything() }
    ],
    joinTableAttributes: []
  });

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(Issues);
  expect(next).not.toHaveBeenCalled();
});




// TC2: tag trovato ma nessuna issue collegata (array vuoto)
test("returns 200 with empty array when tag has no issues", async () => {
  const req = {
    query: {
      content: "bug",
      projectId: 3
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  mockGetIssues.mockResolvedValue([]);
  Tag.findOne.mockResolvedValue({ getIssues: mockGetIssues });

  await issueController.findIssueByTag(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([]);
  expect(next).not.toHaveBeenCalled();
});


// TC3: content mancante 
test("calls next with error when content (tag) is missing", async () => {
  const req = {
    query: {
      projectId: 3
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await issueController.findIssueByTag(req, res, next);

  expect(Tag.findOne).not.toHaveBeenCalled();
  expect(mockGetIssues).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing tag");
  expect(next.mock.calls[0][0].status).toBe(400);
});

// TC4: projectId mancante 
test("calls next with error when projectId is missing", async () => {
  const req = {
    query: {
      content: "bug"
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()   // corretto
  };

  const next = jest.fn();

  await issueController.findIssueByTag(req, res, next);

  expect(Tag.findOne).not.toHaveBeenCalled();
  expect(mockGetIssues).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("missing projectId");
  expect(next.mock.calls[0][0].status).toBe(400);
});



// TC5: projectId non numerico 
test("calls next with error 400 when projectId is not a number", async () => {
  const req = {
    query: {
      content: "bug",
      projectId: "abc"
    }
  };

  const res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  await issueController.findIssueByTag(req, res, next);

  expect(Tag.findOne).not.toHaveBeenCalled();
  expect(mockGetIssues).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("projectId must be a number");
  expect(next.mock.calls[0][0].status).toBe(400);
});




// TC6: tag non trovato
test("calls next with error 404 when tag is not found", async () => {
  const req = {
    query: {
      content: "bug",
      projectId: 3
    }
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  Tag.findOne.mockResolvedValue(null);

  await issueController.findIssueByTag(req, res, next);

  expect(Tag.findOne).toHaveBeenCalledWith({
    where: { content: "bug" }
  });

  expect(mockGetIssues).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].message).toBe("tag not found");
  expect(next.mock.calls[0][0].status).toBe(404);
});








