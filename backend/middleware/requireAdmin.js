import { controllErr } from "../utils/controllError.js";

export function requireAdmin(req,res,next){
   
 if(!req.user){
    controllErr("Unauthorized",401);
}
   

 if(!req.user.admin){
    controllErr("you are not admin",403)
 }

 next(); 

}