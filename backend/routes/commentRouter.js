import { Router } from "express";
import {commentController} from "../controller/commentController.js"; 
import {validationRulesComment} from "../validator/ValidationRulesComment.js"; 
import { validatorRequest } from "../validator/validateRequest.js";
import { enforceAuth } from "../middleware/authorization.js"; 



export const commentRouter = Router(); 

commentRouter.get('/issues/:issueId/comments',enforceAuth,commentController.getComments);  

commentRouter.post("/comments",enforceAuth,validationRulesComment,validatorRequest,commentController.comment); 
