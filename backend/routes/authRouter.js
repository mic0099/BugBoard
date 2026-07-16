import {Router} from "express"; 
import {authController} from "../controller/authController.js"; 
import {enforceAuth} from "../middleware/authorization.js"; 
import {requireAdmin} from "../middleware/requireAdmin.js"; 
import dotenv from "dotenv"; 


export const authRouter = Router(); 

dotenv.config(); 

dotenv.config();

authRouter.post("/login", (req, res, next) => {
  authController.logIn(req)
    .then(logU => {
      const { refreshToken, ...userData } = logU;

      const isLocal = process.env.LOCAL_SESSION === "true";

      const cookieOptions = {
        httpOnly: true,
        path: "/",
        secure: !isLocal,
        sameSite: isLocal ? "lax" : "none",
      };

      // Il cookie persiste per 7 giorni solamente se rememberMe è attivo.
      // Altrimenti è un cookie di sessione.
      if (req.body.rememberMe) {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
      }

      // Aggiungilo solamente se ti serve realmente un cookie CHIPS.
      if (!isLocal) {
        cookieOptions.partitioned = true;
      }

      res.cookie("refreshToken", refreshToken, cookieOptions);

      return res.json({
        success: true,
        ...userData,
      });
    })
    .catch(err => {
      next(err);
    });
});


authRouter.post("/register",enforceAuth,requireAdmin,authController.creaUser); 
authRouter.get("/refreshtoken",authController.rigToken);  
authRouter.get("/me",enforceAuth,authController.loadUser); 
authRouter.post("/logout",enforceAuth,authController.logout);