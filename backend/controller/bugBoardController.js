import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { Comment } from "../models/Database.js"
import { Tag } from "../models/Database.js" 
import { controllErr } from "../utils/controllError.js";
import { Image } from "../models/Database.js"; 
import { Sequelize } from "sequelize";

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
                newProject
            });

        }catch(error){
            next(error);
        }

    }

  static async getAllProjects(req, res, next) {
  try {
    const projects = await Project.findAll({
      attributes: [
        'projectId', 
        'name', 
        'createdAt',
        
        [Sequelize.fn('COUNT', Sequelize.col('Issues.issueId')), 'issuesCount'] 
      ],
      include: [{
        model: Issue,
        attributes: [], 
        required: false
      }],
      group: ['Project.projectId','Project.name','Project.createdAt'], 
      order: [['name', 'ASC']],
    });

    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: 'no existing projects' });
    }

    return res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
}
    

    static async addIssue(req,res,next) {
       
        try{
            const {title,description, priority, type, status, projectId } = req.body;
        
            if(!title || !description || !priority || !type || !status || !projectId ) {
                controllErr("missing required fields", 400);
            }

            const issue = await Issue.create({
                title,
                description,
                priority,
                type,
                status,
                userId:req.user.userId,
                projectId
            });

            return res.status(201).json(issue);
        
        }catch (error) {

            next(error);

        }    
        
    }



  static async getIssues(req,res,next) {

   try {

    const {type,status,priority,sort,order,projectId} = req.query;

    const clausola = {};
    if (type) clausola.type = type;
    if (status) clausola.status = status;
    if (priority) clausola.priority = priority;
    if (projectId) clausola.projectId = Number(projectId);

    const ordinamento = sort || 'createdAt';
    const tipoOrdinamento = order === 'ASC' ? 'ASC' : 'DESC';

    const issues = await Issue.findAll({

    where: clausola,

    order: [[ordinamento,tipoOrdinamento]],

    include: [

      {
        model: User,
        attributes: ['name','surname']
      },

      {
        model: Project,
        attributes: ['name']
      },

      {
        model: Image
      }

    ]

  });

  res.status(200).json(issues);

 } catch(error) {
  next(error);
 }

}

    static async updateStatus(req,res,next){

        try {

            if(!req.body.issueId){
               controllErr("missing required field: issueId",400);  
            }

            if(!req.body.status){
                controllErr("missing required field: status",400)
            }

            const issueId = req.body.issueId; 
            const status = req.body.status; 

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

static async comment(req, res, next) {
  try {

    if (!req.body.issueId) {
      controllErr("missing required field: issueId", 400);
    }

    if (!req.user.userId) {
      controllErr("missing required field: userId", 400);
    }

    if (!req.body.content) {
      controllErr("missing required field: content", 400);
    }

    const comment = await Comment.create({
      content: req.body.content,
      issueId: req.body.issueId,
      userId: req.user.userId
    });

    const result = await Comment.findByPk(comment.commentId,{
      attributes:['commentId','content'],
      include:[
        {
          model:User,
          attributes:['name','surname']
        }
      ]
    });

    return res.status(201).json(result);

  } catch (err) {
    next(err);
  }
}


static async getComments(req,res,next){

 try{

   if(!req.params.issueId){
     controllErr("missing issueId",400)
   }

   const comments = await Comment.findAll({

     where:{issueId:req.params.issueId},

     attributes:['commentId','content'],

     include:[
       {
         model:User,
         attributes:['name','surname']
       }
     ],

     order:[['createdAt','DESC']]

   })

   return res.status(200).json(comments)

 }catch(err){
   next(err)
 }

} 

static async getImmageForIssue(req,res,next){

     try{
        if(!req.params.issueId){
            controllErr('missing issue id',400); 
        }

         const image = await Image.findOne({
          where:{issueId:req.params.issueId}, 
          attributes:['url']
        }); 

        if(!image){
           controllErr('image not found',404)
        }

         return res.status(200).json(image); 

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
 
        if(!req.user.userId){
         controllErr('missing userId',404) 
        }
 
        if(issue.userId!==req.user.userId){
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
                         userId:req.user.userId
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

  const tag = await Tag.findOne({
    where:{content:req.query.content}
  })

  if(!tag){
    controllErr('tag not found',404) 
  }

  const issue = await tag.getIssues({

    include:[
      {
        model: User,
        attributes:['name','surname']
      },
      {
        model: Project,
        attributes:['name']
      },
      {
        model: Image
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
             issueId: req.body.issueId

           });

      return res.json({newPost});

    }catch(err){
        next(err) 
    }    
 }

}