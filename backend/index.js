import express from "express";
import cors from "cors";  
import dotenv from "dotenv";  
import { fileURLToPath } from "url";
import path, { dirname } from "path";  
import cookieParser from "cookie-parser"; 
import { authRouter } from "./routes/authRouter.js"; 
import { issueRouter } from "./routes/issueRouter.js"; 
import { projectRouter } from "./routes/projectRouter.js"; 
import {commentRouter} from "./routes/commentRouter.js"; 




const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename); 
const allowedOrigins = [
  "http://localhost:4200",
  "https://bugboardfrontend.z28.web.core.windows.net"
];




dotenv.config();  
const port=process.env.PORT;  
const app = express();  

app.use(cookieParser()); 
app.use(cors({  
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
})); 

app.use(express.json());   


app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

 
app.use(authRouter);
app.use(projectRouter); 
app.use(commentRouter); 
app.use(issueRouter);


app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


app.use((err, req, res, next) => {
  console.error("errore catturato:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An internal server error occurred"
  });
});

app.listen(port, ()=>{
    console.log(`server avviato su http://localhost:${port}`); 
});  