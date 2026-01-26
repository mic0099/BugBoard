import { DataTypes } from "sequelize";

//gestire noOnlySpace

export function createModel(database){
  database.define('Comment',{
    
       id: {
           type: DataTypes.INTEGER,
           autoIncrement: true, 
           primaryKey: true, 
           allowNull:false,
       },
 
       content: {
          type: DataTypes.STRING, 
          allowNull: false,
          validate : {
            notEmpty:true,
            len: {
            args: [1, 100],
            msg:'The comment content must contain between 1 and 100 characters.'
        },
       },
    },
    }, {
    tableName: 'Comment',
    timestamps:true,
  }

);


};