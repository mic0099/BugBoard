import { Sequelize } from "sequelize"; 
import {createModel as CreateUserModel} from "./User.js"; 
import {createModel as CreateCommentModel} from "./Comment.js" ;
import {createModel as CreateTagModel} from "./Tag.js";
import {createModel as CreateRefreshTokens } from "./RefreshToken.js"; 
import bcrypt from "bcrypt"; 
import fs from "fs";
import path from "path"; 

export const database = new Sequelize({
  dialect: 'sqlite',
  storage: 'data/data.sqlite', 
}
); 

CreateUserModel(database); 
CreateCommentModel(database);
CreateTagModel(database); 
CreateRefreshTokens(database); 

export const  {User,Comment,Tag,RefreshToken} = database.models 

User.addHook('beforeCreate',async (user)=>{ //hook per hash delle password 
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(user.password,salt);  
});

database.sync().then( () => { 
  console.log("Database synced correctly");
}).catch( err => {
  console.error("Error with database synchronization: " + err.message);
});  

