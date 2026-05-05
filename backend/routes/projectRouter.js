import { Router } from "express"; 
import { projectController } from "../controller/projectController.js";
import {validatorRequest} from "../validator/validateRequest.js";
import {requireAdmin} from "../middleware/requireAdmin.js";
import {validationRulesProject} from "../validator/validationRulesProject.js";
import { enforceAuth } from "../middleware/authorization.js";




export const projectRouter = Router(); 

projectRouter.post("/addProject",enforceAuth,requireAdmin,validationRulesProject,validatorRequest,projectController.addProject);
projectRouter.get("/getProjects",enforceAuth,projectController.getAllProjects);
projectRouter.put("/updateProject/:projectId",enforceAuth,requireAdmin,projectController.updateProject);
projectRouter.get("/verifyEmail",enforceAuth,projectController.verifyEmail);


