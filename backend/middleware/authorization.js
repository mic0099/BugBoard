import { authController } from "../controller/authController.js";
import { controllErr } from "../utils/controllError.js";

export function enforceAuth (req,res,next){ 
    const header = req.headers["authorization"]; //si recupera il token 

    if(!header){
       controllErr("access denied: invalid or missing token",401); 
    }

    const parts = header.split(' '); //si splitta il token 
    
    if(parts.length!==2 || parts[0]!=='Bearer'){ 
      controllErr("access denied: invalid or missing token",401);
    }

    const token = parts[1]; 

    if(!token){ 
        controllErr("Access denied: invalid or missing token",401);
    } 

    authController.verifyToken(token,(err,decode)=>{ //verifico validità del token err errori generati dal token, decode token decodificato
         if(err){ //verifico se ci sono errori 
            controllErr("Access denied: invalid or missing token",401);
         }
         req.user={userId:decode.userId,admin:decode.admin}; //creo nuova prorietà nell'oggetto della richiesta e ci salvo lo username 
         next(); 
    }); 
} 