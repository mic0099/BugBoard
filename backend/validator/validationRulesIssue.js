import {body} from "express-validator"; 


export const validationRulesIssue = [
   body("title")
    .exists({checkNull:true}) 
    .trim() 
    .notEmpty().withMessage("title is required")
    .isString()
    .isLength({min:3,max:15}).withMessage("Title must between 3 and 15 characters long"),    
   body("description") 
    .exists({checkNull:true}) 
    .trim() 
    .notEmpty().withMessage("description is required")
    .isString()
    .isLength({min:10,max:200}).withMessage("description must between 10 and 200 characters long"),
   body("priority")
    .exists({ checkNull: true })
    .withMessage("Priority is required")
    .isIn(["low", "medium", "high", "blocker"])
    .withMessage("Priority must be one of: low, medium, high, blocker"),
   body("type")
    .exists({ checkNull: true })
    .withMessage("type is required")
    .isIn(["question", "bug", "documentation", "feature"])
    .withMessage("type must be one of: question, bug, documentation, feature"),
   body("status")  
    .exists({ checkNull: true })
    .withMessage("status is required")
    .isIn(["open", "todo"])
    .withMessage("status must be one of: open, todo,"), 
]