import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { Comment } from "../models/Database.js";
import { Tag } from "../models/Database.js";
import { controllErr } from "../utils/controllError.js";
import { Image } from "../models/Database.js"; 
import { database } from "../models/Database.js"; 
import { Sequelize } from "sequelize";

export class issueController {

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

      return res.status(201).json({issueId: issue.issueId});
    
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


  static async getIssueById(req,res,next) {
    try {
      const { id } = req.params;
  
      const issue = await Issue.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ['userId', 'name', 'surname'] 
          },
          {
            model: Project,
            attributes: ['projectId', 'name'] 
          },
          {
            model: Image,
            attributes: ['url']
          }
        ]
      });
  
      if (!issue) {
        controllErr("issue not found",404); 
      }
  
      return res.json(issue);
    } catch (error) { 
        next(error); 
    }
  }




  static async updateStatus(req, res, next) { //definire validator 
    try {
      if (!req.body.issueId) controllErr("missing required field: issueId", 400);
      if (!req.body.status) controllErr("missing required field: status", 400); 
  
      const issueId = req.body.issueId;
      const newStatus = req.body.status;
      const issue = await Issue.findByPk(issueId); 
  
      if (!issue) controllErr("Issue not found", 400);
  
      
      if (String(issue.userId) !== String(req.user.userId)) {
        controllErr("Forbidden: Only the creator can change the status",403); 
      }
  
     
      if (issue.status === 'closed') {
        controllErr("Cannot change status of a closed issue",400); 
      }
  
      
      const allowedTransitions = {
        'todo': 'open',
        'open': 'in_progress',
        'in_progress': 'closed',
      };
  
      if (allowedTransitions[issue.status] !== newStatus) { //verificare se si puo fare stessa cosa con controllErr
        return res.status(400).json({ 
          message: `Cannot transition from ${issue.status} to ${newStatus}` 
        });
      }
  
      await issue.update({ status: newStatus });
      res.status(200).json({ success: true, message: `Status changed to ${newStatus}`, data: issue });
  
    } catch (error) {
      next(error);
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
        return res.status(200).json({ url: null });
      }

      return res.status(200).json(image); 

    }catch(err){
      next(err);
    }
  }

  
 static async createtag(req,res,next){
  try{    

    const { issueId } = req.params;

    if(!issueId){
      controllErr('missing issueId',400) 
    } 

    const issue = await Issue.findByPk(issueId);

    if(!issue){
      controllErr('issue not found',404) 
    }

    if(!req.user.userId){
      controllErr('missing userId',401) 
    }

    if(issue.userId!==req.user.userId){
      controllErr("you can't add tags to an issue that isn't yours",403)
    }

    const tags = req.body.tags;

    if (!Array.isArray(tags) || tags.length === 0) {
      controllErr("no tags provided",400);
    }

    for(const tagContent of tags){
      const [newtag] = await Tag.findOrCreate({
        where: {content:tagContent},
        defaults:{
          userId:req.user.userId
        }
      });

      const verifTag = await issue.hasTag(newtag);

      if(!verifTag){
        await issue.addTag(newtag); 
      }
    }

    return res.status(200).json({message:"tags associated to the post"}); 

  }catch(err){
    next(err); 
  }   
}
  


static async findIssueByTag(req,res,next){
  try{   
    
    if(!req.query.content){
      controllErr('missing tag',400)
    }

    if(!req.query.projectId){
      controllErr('missing projectId',400)
    }

    const tag = await Tag.findOne({
      where:{content:req.query.content}
    })

    if(!tag){
      controllErr('tag not found',404) 
    }

    const issue = await tag.getIssues({
      where:{
        projectId: Number(req.query.projectId)
      }, 
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

      if(!req.params.issueId){
        controllErr("missing required field: issueId",400) 
      }

      const issue = await Issue.findByPk(req.params.issueId); 
      if(!issue){
        controllErr("Issue not found",404); 
      }

      const verifyIss = await Image.findOne({where:{issueId:req.params.issueId}}) 
      if(verifyIss){
        controllErr("Issue already has an associated image",409); 
      }

      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`; 
      console.log(imageUrl);
      
      const newPost = await Image.create({
        url:imageUrl,
        issueId: req.params.issueId
      });

      return res.json({newPost});

    }catch(err){
      next(err) 
    }    
  }

} 

