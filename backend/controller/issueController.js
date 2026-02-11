import { Issue } from "../models/Database.js";
import { User } from "../models/Database.js";
import { Project } from "../models/Database.js";
import { controllErr } from "../utils/controllError.js";

export class issueController {

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
}