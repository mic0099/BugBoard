import { Sequelize } from "sequelize"; 
import {createModel as CreateUserModel} from "./User.js"; 
import {createModel as CreateCommentModel} from "./Comment.js" ;
import {createModel as CreateTagModel} from "./Tag.js";
import {createModel as CreateIssueModel} from "./Issue.js"; 
import {createModel as CreateProjectModel } from "./Project.js"; 
import {createModel as CreateImageModel } from "./Image.js"; 
import {createModel as CreateRefreshTokensModel } from "./RefreshToken.js"; 

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
CreateRefreshTokensModel(database); 
CreateIssueModel(database);
CreateProjectModel(database);
CreateImageModel(database);

export const  {User,Comment,Tag,RefreshToken,Issue,Project,Image} = database.models

User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Project, { through: 'UserProjects', foreignKey: 'userId' });
Project.belongsToMany(User, { through: 'UserProjects', foreignKey: 'projectId' });

User.hasMany(Issue, { foreignKey: 'userId' });
Issue.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Tag, { foreignKey: 'userId' });
Tag.belongsTo(User, { foreignKey: 'userId' });

Project.hasMany(Issue, { foreignKey: 'projectId' });
Issue.belongsTo(Project, { foreignKey: 'projectId' });

Issue.hasOne(Image, { foreignKey: 'issueId' });
Image.belongsTo(Issue, { foreignKey: 'issueId' });

Issue.hasMany(Comment, { foreignKey: 'issueId' });
Comment.belongsTo(Issue, { foreignKey: 'issueId' });

Issue.belongsToMany(Tag, { through: 'IssueTags', foreignKey: 'issueId' });
Tag.belongsToMany(Issue, { through: 'IssueTags', foreignKey: 'tagId' });


User.addHook('beforeCreate',async (user)=>{ //hook per hash delle password 
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(user.password,salt);  
});

database.sync().then( () => { 
  console.log("Database synced correctly");
}).catch( err => {
  console.error("Error with database synchronization: " + err.message);
});  

