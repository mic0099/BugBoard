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
        {
            title: "issue test"
        }
    ];

    mockGetIssues.mockResolvedValue(Issues);

    Tag.findOne.mockResolvedValue({
        getIssues: mockGetIssues
    });

    await issueController.findIssueByTag(req, res, next);

    expect(Tag.findOne).toHaveBeenCalledWith({
        where: {
            content: "bug"
        }
    });

    expect(mockGetIssues).toHaveBeenCalledWith({
        where: {
            projectId: 3
        },
        include: [
            {
                model: expect.anything(),
                attributes: ['name', 'surname']
            },
            {
                model: expect.anything(),
                attributes: ['name']
            },
            {
                model: expect.anything()
            }
        ],
        joinTableAttributes: []
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(Issues);

    expect(next).not.toHaveBeenCalled();

});


test("calls next with error when projectId is missing", async () => {

  const req = {
    query : {
        content:"bug"
    }
  }

  const res = {
    status : jest.fn(), 
    json : jest.fn().mockReturnThis(),  
  }

  const next = jest.fn(); 

  const Issues = [
        {
            title: "issue test"
        }
    ];

  mockGetIssues.mockResolvedValue(Issues);

  Tag.findOne.mockResolvedValue({
        getIssues: mockGetIssues
    });  

   await issueController.findIssueByTag(req,res,next); 
  
    expect(Tag.findOne).not.toHaveBeenCalled(); 

    expect(mockGetIssues).not.toHaveBeenCalled(); 

    expect(next).toHaveBeenCalled(); 

    expect(next.mock.calls[0][0].message)
     .toBe("missing projectId");

    expect(next.mock.calls[0][0].status)
     .toBe(400);


}) 

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
    where: {
      content: "bug"
    }
  });

  expect(mockGetIssues).not.toHaveBeenCalled();

  expect(res.status).not.toHaveBeenCalled();

  expect(res.json).not.toHaveBeenCalled();

  expect(next).toHaveBeenCalled();

  expect(next.mock.calls[0][0].message)
    .toBe("tag not found");

  expect(next.mock.calls[0][0].status)
    .toBe(404);

});