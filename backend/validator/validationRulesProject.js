import {body} from "express-validator" 

export const validationRulesProject=[
   body("name")
   .exists({checkNull:true}) 
   .trim() 
   .notEmpty().withMessage("project name is required") 
   .isString() 
   .isLength({min:3,max:50}).withMessage("project name must between 3 and 50 characters long") 
]