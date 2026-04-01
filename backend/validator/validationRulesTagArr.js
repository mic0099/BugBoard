import {body} from "express-validator"; 
import validator from "validator"; 


export const validationRulesTagArr=[
  body("tags")
   .customSanitizer(value=> Array.isArray(value) ? value : [value])
   .isArray().withMessage("content must be an array")
   .bail()
   .custom(arr=>{
      return arr.every(tag=>{
          if(typeof tag !== 'string') return false; 
          const trimmed = tag.trim();
          if (trimmed.length < 1 || trimmed.length > 20) return false;
          return true; 
       })
   })
   .customSanitizer(arr=>arr.map(tag=>validator.trim(tag).toLocaleLowerCase()))
]