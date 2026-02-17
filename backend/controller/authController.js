
import {User} from "../models/Database.js" 
import { RefreshToken } from "../models/Database.js"; 
import bcrypt from 'bcrypt'; 
import { controllErr } from "../utils/controllError.js" 
import jwt from 'jsonwebtoken'

export class authController{

    static async creaUser(req,res,next){ 
    
    try{    
        if(!req.body.email){
            controllErr('missing parameter email is required',400)
        }

        if(!req.body.name){
            controllErr('missing parameter name is required',400) 
        }

        if(!req.body.surname){
            controllErr('missing parameter surname is required',400)
        }

         if(!req.body.password){
          controllErr("missing parameter password is required",400);
         } 

         if(req.body.admin===undefined){
          controllErr("missing parameter admin is required",400);
         } 
    
        const user = await User.create({
          email: req.body.email, 
          name: req.body.name, 
          surname: req.body.surname,
          password: req.body.password, 
          admin: req.body.admin
        });
   
        res.status(201).json(user)
        
    }catch(err){
        next(err)
    }    

    } 
 
   static async logIn(req){
        
        if(!req.body.email){
         controllErr("missing parameter email is required",400);
        }
        
        if(!req.body.password){
         controllErr("missing parameter password is required",400);
        } 
        const lUser= await User.findOne({where:{email:req.body.email}}); 
     
        if(!lUser){
         controllErr("invalid username or password",401); 
        }
        
        const isMatch = await bcrypt.compare(req.body.password,lUser.password);
        if(!isMatch){
             controllErr("invalid username or password",401); 
        }
           const accessToken = jwt.sign(
           {userId:lUser.userId,admin:lUser.admin}, 
           process.env.TOKEN_SECRET,
           {expiresIn: '10m'}, 
       ); 
   
           const refreshToken = jwt.sign(
            {userId:lUser.userId}, 
            process.env.TOKEN_SECRET,
            {expiresIn:'7d'}, 
       );
   
        const day = 7 * 24 * 60 * 1000; 
        const expiresAt = new Date(Date.now()+day);  
   
      if(req.body.rememberMe){  
        await RefreshToken.create({
             token: refreshToken, 
             expiresAt: expiresAt,
             userId: lUser.userId,
       });
      }   
   
       return {
           userId:lUser.userId, 
           name:lUser.name,
           lastname:lUser.surname,  
           accessToken,
           refreshToken,
       }
        
       }

    static async rigToken(req,res,next){
    try{
      if(!req.cookies.refreshToken){
         controllErr("token not found",401);
      }   
  
    const verifyT = await RefreshToken.findOne({where:{token:req.cookies.refreshToken}});
    if(!verifyT){
        controllErr('token not found',400);
    }
    const user = await User.findByPk(verifyT.userId); 
    if(req.body.rememberMe){
      if(verifyT.expiresAt<new Date()){
        await verifyT.destroy(); 
        controllErr("refreshToken scaduto",403); 
      }
    }
        const accessToken = jwt.sign(
        {userId:user.userId,admin:user.admin}, 
        process.env.TOKEN_SECRET,
        {expiresIn: '10m'}, 
    ); 
    
    return res.json({accessToken:accessToken}); 
    }catch(err){
        next(err);
    }

    }   

    static verifyToken(token,call){
            jwt.verify(token,process.env.TOKEN_SECRET,call); 
    }

}