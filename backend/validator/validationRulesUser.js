import {body} from "express-validator"; 


export const validationRulesUser = [
  body("email")
   .exists({checkNull:true})
   .trim()
   .notEmpty().withMessage("email is required")
   .isEmail().withMessage("invalid email address") 
   .normalizeEmail(),
  body("password")
   .exists({checkNull:true})
   .isString() 
   .notEmpty().withMessage("password is required") 
   .isLength({min:8,max:64}).withMessage("the password must between 8 and 64 characters long") 
   .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
   .withMessage(
    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  ), 
  body("name") 
   .exists({checkNull:true})
   .trim() 
   .isString()
   .notEmpty().withMessage("name is required") 
   .isLength({min:3,max:30}).withMessage("the name must between 3 and 30 characters long"), 

   body("surname") 
    .exists({checkNull:true})
    .trim() 
    .isString()
    .notEmpty().withMessage("surname is required")
    .isLength({min:3,max:30}).withMessage("the surname must between 3 and 30 characters long") 
  
]