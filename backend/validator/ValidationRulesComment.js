
import {body} from "express-validator"; 

export const validationRulesComment=[

   body('content')
     .isString().withMessage("content must be a string")
     .trim()
     .isLength({min:1,max:100}).withMessage("content must be between 1 and 100 characters")
];