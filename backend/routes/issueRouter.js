import { Router } from "express";
import {issueController} from "../controller/issueController.js"
import {enforceAuth} from "../middleware/authorization.js"
import {upload} from "../middleware/multer.js" 
import {validationRulesIssue} from "../validator/validationRulesIssue.js"  
import {validationRulesComment} from "../validator/ValidationRulesComment.js" 
import {validationRulesTagArr} from "../validator/validationRulesTagArr.js" 
import {validationRulesTag} from "../validator/validationRulesTag.js" 
import {validatorRequest} from "../validator/validateRequest.js" 
import {requireAdmin} from "../middleware/requireAdmin.js"


export const issueRouter = Router();


issueRouter.post("/addIssue",enforceAuth,validationRulesIssue,validatorRequest,issueController.addIssue);  
issueRouter.get("/getIssues",enforceAuth,issueController.getIssues); 

issueRouter.get("/issues/by-tag",enforceAuth,validationRulesTag,validatorRequest,issueController.findIssueByTag); 
issueRouter.get('/issues/:issueId/comments',enforceAuth,issueController.getComments); 
issueRouter.get('/issues/:issueId/image',enforceAuth,issueController.getImmageForIssue);
issueRouter.post("/issues/:issueId/tags",enforceAuth,validationRulesTagArr,validatorRequest,issueController.createtag);
issueRouter.post("/issues/:issueId/image",enforceAuth,upload.single('image'),issueController.update_image); 

issueRouter.get("/issues/:id", enforceAuth,issueController.getIssueById);

issueRouter.patch("/updateStatus",enforceAuth,issueController.updateStatus); // da validare 
issueRouter.post("/comments",enforceAuth,validationRulesComment,validatorRequest,issueController.comment); 