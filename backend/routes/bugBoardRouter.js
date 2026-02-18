import { Router } from "express";
import {BugBoardController} from "../controller/bugBoardController.js"
import {enforceAuth} from "../middleware/authorization.js"
import {upload} from "../middleware/multer.js" 
import {validationRulesIssue} from "../validator/validationRulesIssue.js"  
import {validationRulesComment} from "../validator/ValidationRulesComment.js" 
import {validationRulesTagArr} from "../validator/validationRulesTagArr.js" 
import {validationRulesTag} from "../validator/validationRulesTag.js" 
import {validationRulesProject} from "../validator/validationRulesProject.js"
import {validatorRequest} from "../validator/validateRequest.js"


export const bugBoardRouter = Router();

bugBoardRouter.post("/addProject",enforceAuth,validationRulesProject,validatorRequest,BugBoardController.addProject);
bugBoardRouter.post("/addIssue",enforceAuth,validationRulesIssue,validatorRequest,BugBoardController.addIssue);  
bugBoardRouter.get("/getIssues",enforceAuth,BugBoardController.getIssues); 
bugBoardRouter.patch("/status",enforceAuth,BugBoardController.updateStatus); 
bugBoardRouter.post("/comments",enforceAuth,validationRulesComment,validatorRequest,BugBoardController.comment); 
bugBoardRouter.post("/tags",enforceAuth,validationRulesTagArr,validatorRequest,BugBoardController.createtag);
bugBoardRouter.get("/findBytag",enforceAuth,validationRulesTag,validatorRequest,BugBoardController.findIssueByTag); 
bugBoardRouter.post("/uploadImage",enforceAuth,upload.single('image'),BugBoardController.update_image); 