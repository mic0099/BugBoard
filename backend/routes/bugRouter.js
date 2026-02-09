import {Router} from "express"; 
import {BugController} from "../controller/BugController.js"

export const bugRouter = Router(); 


bugRouter.post("/comments",(req,res,next)=>{

  const comm=BugController.comment(req) 

   comm.then((newComment)=>{
      res.json(newComment)
   }).catch((err)=>{
       next(err); 
   })

}); 

bugRouter.post("/tags",(req,res,next)=>{
   const tag=BugController.createtag(req)

   tag.then(()=>{
      res.json("tag creato")
   }).catch((err)=>{
      next(err)
   })
}) 

bugRouter.get("/tag",(req,res,next)=>{
   const issue=BugController.findIssueByTag(req)

   issue.then((iss)=>{
      res.json(iss)
   }).catch((err)=>{
      next(err) 
   })
})