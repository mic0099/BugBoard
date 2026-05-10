import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { Comment } from "../models/Database.js";
import { Tag } from "../models/Database.js";
import { controllErr } from "../utils/controllError.js";
import { Image } from "../models/Database.js"; 
import { database } from "../models/Database.js"; 
import { Sequelize } from "sequelize";

export class projectController{ 

    static async addProject(req, res, next) {
      try {
        const { name, emails } = req.body;
    
        if (!name) {
          controllErr("missing required field: name", 400);
        }
    
        await database.transaction(async (t) => {
    
          const newProject = await Project.create(
            { name },
            { transaction: t }
          );
    
          let emailsList = Array.isArray(emails) ? [...emails] : [];
    
          const admin = await User.findByPk(req.user.userId, { transaction: t });
    
          if (admin) {
            emailsList.push(admin.email);
          }
    
          emailsList = [...new Set(emailsList)];
    
          if (emailsList.length > 0) {
    
            const users = await User.findAll({
              where: { email: emailsList },
              transaction: t
            });
    
            if (users.length > 0) {
              await newProject.addUsers(users, { transaction: t });
            }
          }
    
        });
    
        res.status(201).json({ message: "project created successfully" });
    
      } catch (error) {
        next(error);
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
    
    
    
      static async updateProject(req,res,next) { //definire validator 
        try {
          const { projectId } = req.params;
          const { name, emails, removeEmails } = req.body; 
    
          const result = await database.transaction(async (t) => {
            const project = await Project.findByPk(projectId, { transaction: t });
    
    
            if(!project) {
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

        static async verifyEmail(req, res, next) { //definire validator email 
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
}