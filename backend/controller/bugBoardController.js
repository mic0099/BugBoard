import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { Comment } from "../models/Database.js"
import { Tag } from "../models/Database.js" 
import { controllErr } from "../utils/controllError.js";

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