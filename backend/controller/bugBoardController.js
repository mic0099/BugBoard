import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { Comment } from "../models/Database.js"
import { Tag } from "../models/Database.js" 
import { controllErr } from "../utils/controllError.js";
import { Image } from "../models/Database.js";

export class BugBoardController {


    static async addProject(req,res,next){

        try{

            const {name} = req.body;

            if(!name ) {
                controllErr("missing required field", 400);
            }
            
            const newProject = await Project.create({
                name
            });

            res.status(201).json({
                success: true,
                message: "project created successfully",
                data: newProject
            });

        }catch(error){
            next(error);
        }

    }
    

    static async addIssue(req,res,next) {
       
        try{
            const {title,description, priority, type, status, userId, projectId } = req.body;
        
            if(!title || !description || !priority || !type || !status || !userId || !projectId ) {
                controllErr("missing required fields", 400);
            }

      
            const issue = await Issue.create({
                title,
                description,
                priority,
                type,
                status,
                userId,
                projectId
            });

            return res.status(201).json(issue);
        
        }catch (error) {

            next(error);

        }    
        
    }



    static async getIssues(req,res,next) {

        try {

            const {type,status,priority,sort,order} = req.query;

            const clausola = {};
            if (type) clausola.type=type;
            if (status) clausola.status=status;
            if (priority) clausola.priority=priority;

            const ordinamento = sort || 'createdAt';
            const tipoOrdinamento = order === 'ASC' ? 'ASC' : 'DESC';
        
            const issues = await Issue.findAll({
                where: clausola,
                order: [[ ordinamento,tipoOrdinamento]],
                include: [
                    {
                        model: User,
                        attributes: ['name', 'surname']
                    },
                    {
                        model:Project,
                        attributes: ['name']
                    } 
                ]
            });

            res.status(200).json(issues);
        
        }catch(error){
            next(error);
        }

    }


    static async updateStatus(req,res,next){

        try {
            const {issueId, status}=req.body;

            const issue = await Issue.findByPk(issueId);

            if(!issue) {
                
                controllErr("Issue not found", 400);
            }

            await issue.update({status});

            res.status(200).json({
                success: true,
                message:`Issue status changed to  $(status)`,
                data: issue
            });
        
        }catch(error){
            next(error);
        }
    }

    static async comment(req,res,next){ 
     try{   
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
 
        const allCommentForIssue = await Comment.findAll({
               where:{issueId:req.body.issueId},
               order:[['createdAt','DESC']], 
               raw:true,
        })
 
     return res.status(200).json(allCommentForIssue); 

     }catch(err){
        next(err); 
     } 
 
}
 
    static async createtag(req,res,next){
    
    try{    
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
           return res.status(200).json("tag associated to the post"); 
        }catch(err){
            next(err); 
        }   
 
    }
 
    static async findIssueByTag(req,res,next){
      try{   
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
 
        return res.status(200).json(issue);

      }catch(err){
        next(err); 
      } 
 
    }

    static async update_image(req,res,next){ 

    try{    
      if (!req.file) {
       controllErr("you must provide a file to upload the post",400);
     }

     if(!req.body.issueId){
        controllErr("missing required field: issueId",400) 
     }

     const issue = await Issue.findByPk(req.body.issueId); 
     if(!issue){
        controllErr("Issue not found",404); 
     }

     const verifyIss = await Image.findOne({where:{issueId:req.body.issueId}}) 
     if(verifyIss){
        controllErr("Issue already has an associated image",409); 
     }

      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`; 
      console.log(imageUrl);

            const newPost = await Image.create({
             
             url:imageUrl,
             userId: req.user.userId, 
             issueId: req.body.issueId

           });

      return res.json({newPost});

    }catch(err){
        next(err) 
    }    
 }

}