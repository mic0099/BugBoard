import { controllErr } from "../utils/controllError.js"
import { Comment } from "../models/Database.js"
import { Issue } from "../models/Database.js" 
import { Tag } from "../models/Database.js" 


export class BugController {

 
   static async comment(req){ 
       if(!req.body.issueId){
          controllErr("missing required field: issueId",400) 
       }

       if(!req.body.userId){
          controllErr("missing required field: userId",400) 
       }

       if(!req.body.content){
        controllErr("missing required field: content",400)
       }

       await Comment.create({
        content: req.body.content, 
        issueId: req.body.issueId, 
        userId: req.body.userId
       })

       const allCommentForIssue = Comment.findAll({
              where:{issueId:req.body.issueId},
              order:[['createdAt','DESC']], 
              raw:true,
       })

    return allCommentForIssue; 

   }

   static async createtag(req){
      
       if(!req.body.issueId){
         controllErr('missing issueId',404) 
       } 

       const issue = await Issue.findByPk(req.body.issueId)  

       if(!issue){
        controllErr('issue not found',404) 
       }

       if(!req.body.userId){
        controllErr('missing userId',404) 
       }

       if(issue.userId!==req.body.userId){
        controllErr("you can't add tags a post that isn't yours",400)
       }

       const tags=req.body.tags 

       if(tags.length===0){
        controllErr("no tags provideds",400) 
       }

            for(const tagContent of tags){
              const [newtag,created] = await Tag.findOrCreate({
                    where: {content:tagContent},
                    defaults:{
                        userId:req.body.userId
                    }
             });
             const verifTag = await issue.hasTag(newtag);
             if(!verifTag){
               await issue.addTag(newtag); 
             }
             else{
                controllErr("the tag is already associated with this post",400); 
             }
             
          }

   }

   static async findIssueByTag(req){
        
         if(!req.query.content){
            controllErr('missing tag',400)
         }

        const tag = await Tag.findOne({where:{content:req.query.content}})

        if(!tag){
          controllErr('tag not found',404) 
        }

        const issue = await tag.getIssues({
           include:[{
                 model: Comment,
                 }
             ], 
            joinTableAttributes:[]
        })

return issue; 

   }


}
