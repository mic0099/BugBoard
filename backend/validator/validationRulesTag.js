import { query } from "express-validator";

export const validationRulesTag=[
      query('content')
       .isString().withMessage("tag must be a string")
       .trim()
       .isLength({min:1,max:20})
]
