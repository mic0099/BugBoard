import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { Comment } from "../models/Database.js";
import { Tag } from "../models/Database.js";
import { controllErr } from "../utils/controllError.js";
import { Image } from "../models/Database.js"; 
import { database } from "../models/Database.js"; 
import { Sequelize } from "sequelize";

export class BugBoardController {

  static async addProject(req, res, next) {
    try {
      const { name, emails } = req.body;

      if (!name) {
        controllErr("missing required field: name", 400);
      }

      const result = await database.transaction(async (t) => {

        
        const newProject = await Project.create(
          { name },
          { transaction: t }
        );

        let addedUsers = 0;
        let notFound = [];

        
        if (emails && Array.isArray(emails) && emails.length > 0) {

          const users = await User.findAll({
            where: { email: emails },
            transaction: t
          });

          
          const foundEmails = users.map(u => u.email);

          
          notFound = emails.filter(e => !foundEmails.includes(e));

          
          if (users.length > 0) {
            await newProject.addUsers(users, { transaction: t });
            addedUsers = users.length;
          }
        }  
      });

      res.status(201).json({message:"project created successfully"});

    } catch (error) {
      next(error);
    }
  }



  static async addUsersToProject (req,res,next) {
    try {
      const projectId  = req.params.projectId;
      const emails  = req.body.emails;


      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        controllErr("email is required",400)
      }

      const project = await Project.findByPk(projectId);
      if (!project) {
        controllErr("project not found",404)
      }

      const users = await User.findAll({
        where: {
          email: emails
        }
      });

      await project.addUsers(users);

      return res.status(200).json({
        message: "Users added successfully",
      });

    } catch (err) {
      next(err); 
    }
  }



  static async getAllProjects(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const projects = await user.getProjects({
        attributes: [
          'projectId',
          'name',
          'createdAt',
          [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Issues.issueId'))), 'issuesCount']
        ],
        include: [
          {
            model: Issue,
            attributes: [],
            required: false
          },
          {
            model: User,
            attributes: ['email', 'name', 'surname'], 
            through: { attributes: [] },
            required: false
          }
        ],
        group: ['Project.projectId','Users.userId'],
        order: [['name', 'ASC']],
        subQuery: false
      });

      return res.status(200).json(projects);

    } catch (error) {
      next(error);
    }
  }    



  static async updateProject(req,res,next) {
    try {
      const { projectId } = req.params;
      const { name, emails, removeEmails } = req.body;

      const result = await database.transaction(async (t) => {
        const project = await Project.findByPk(projectId, { transaction: t });


        if(!project) {console.log("Nome nel DB:", project.name);
          console.log("Nome inviato dal Frontend:", name);
          controllErr("Missing Project", 404);
        }

        if(name) {
          project.name = name;
          await project.save ({ transaction: t });
        }

        if(emails && Array.isArray(emails) && emails.length > 0) {
          const usersToAdd = await User.findAll({
            where: {email:emails},  
            transaction: t
          });
          await project.addUsers(usersToAdd, { transaction: t });
        }

        if(removeEmails && Array.isArray(removeEmails) && removeEmails.length > 0) {
          const usersToRemove =  await User.findAll({
            where: {email: removeEmails},
            transaction: t
          });

          await project.removeUsers(usersToRemove, { transaction: t });
        }
        return project;
      });

      res.status(200).json({ message: "project updated succeded" });

    }catch (error){
      next(error);
    }
  }



  static async verifyEmail(req, res, next) {
    try {
      const { email } = req.query;
      const user = await User.findOne({ where: { email } });
      
      if (user) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(404).json({ exists: false, message: "Utente non trovato" });
      }
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
        return res.status(404).json({ message: "Issue not found" });
      }
  
      return res.json(issue);
    } catch (error) {
      console.error("Error fetching issue:", error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
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