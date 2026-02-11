import { Router } from "express";
import { issueController } from "../controller/issueController.js"

export const issueRouter = Router();

issueRouter.post("/addIssue", issueController.addIssue);
issueRouter.get("/getIssues",issueController.getIssues);