
import { User, Comment } from "../models/Database.js";
import { controllErr } from "../utils/controllError.js";



export class commentController{ 

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

}