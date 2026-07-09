
import {User, RefreshToken} from "../models/Database.js" 
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
           {expiresIn: '5m'}, 
       ); 
   
           const refreshToken = jwt.sign(
            {userId:lUser.userId,admin:lUser.admin},  
            process.env.TOKEN_SECRET,
            {expiresIn:'7d'}, 
       );
   
        const day = 7 * 24 * 60 * 60 * 1000;  
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
           surname:lUser.surname,  
           accessToken,
           refreshToken,
       }
        
       }

static async rigToken(req, res, next){
  try{
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      controllErr("token not found",401);
    }


    const decoded = jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET
    );


    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken }
    });

    if(storedToken){
      if(storedToken.expiresAt < new Date()){
        await storedToken.destroy();
        controllErr("refreshToken scaduto",403);
      }
    }

    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        admin: decoded.admin
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '5m' }
    );

    return res.json({ accessToken });

  }catch(err){
    next(err);
  }
}


static verifyToken(token,call){
            jwt.verify(token,process.env.TOKEN_SECRET,call); 
    }

    
static async loadUser(req,res,next){
   if(!req.user.userId){
    controllErr('Authentication token is missing required claims',401);
   }

  try{ 
  const user = await User.findByPk(req.user.userId); 
  if(!user){
    controllErr('user not found',404); 
  }
  return res.status(200).json({
    name:user.name, 
    surname:user.surname
  })
  }catch(err){
    next(err);
  }
}    

static async logout(req,res,next){

  try{ 
   if(!req.user.userId){
     controllErr("Authentication token is missing required claims",401); 
   }


      await RefreshToken.destroy({where: {userId:req.user.userId} }); 


  res.clearCookie("refreshToken", {
  httpOnly: true,
  path: '/',
  secure: true,
  sameSite: 'none',
  partitioned: 'true'
  });    

  res.status(200).json({message:"Logged out successfully"});
    
  }catch(err){
    next(err)
  }
}

}