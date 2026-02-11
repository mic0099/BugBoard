import { Router } from "express";
import {BugBoardController} from "../controller/bugBoardController.js"


export const bugBoardRouter = Router();

bugBoardRouter.post("/addProject", BugBoardController.addProject);
bugBoardRouter.post("/addIssue", BugBoardController.addIssue);
bugBoardRouter.get("/getIssues",BugBoardController.getIssues);
bugBoardRouter.patch("/status", BugBoardController.updateStatus);
bugBoardRouter.post("/comments",(req,res,next)=>{

  const comm=BugBoardController.comment(req) 

   comm.then((newComment)=>{
      res.json(newComment)
   }).catch((err)=>{
       next(err); 
   })

}); 

bugBoardRouter.post("/tags",(req,res,next)=>{
   const tag=BugBoardController.createtag(req)

   tag.then(()=>{
      res.json("tag creato")
   }).catch((err)=>{
      next(err)
   })
}) 

bugBoardRouter.get("/tag",(req,res,next)=>{
   const issue=BugBoardController.findIssueByTag(req)

   issue.then((iss)=>{
      res.json(iss)
   }).catch((err)=>{
      next(err) 
   })
})