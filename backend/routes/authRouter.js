import {Router} from "express"; 
import {authController} from "../controller/authController.js"; 
import {enforceAuth} from "../middleware/authorization.js"; 


export const authRouter = Router(); 

authRouter.post("/login",(req,res,next)=>{
authController.logIn(req)
  .then(logU => {
    const { refreshToken,...userData } = logU;
    
    if(req.body.rememberMe){
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 *  60 *1000, 
      path: '/',           
      secure: false,       
      sameSite: 'lax'
    });
  }else{
      res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',           
      secure: false,       
      sameSite: 'lax'
    });
  }
    return res.json({ success: true, ...userData });
  })
  .catch(err=>{
     next(err); 
  });

    
}); 

authRouter.post("/register",authController.creaUser); 
authRouter.get("/refreshtoken",authController.rigToken);  
authRouter.get("/me",enforceAuth,authController.loadUser); 
authRouter.post("/logout",enforceAuth,authController.logout);