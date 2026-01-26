import { DataTypes } from "sequelize" 
//definire primary key per user
//gestire formattazione password, usrname e email e gestione spazi stringhe
export function createModel(database) { 
  database.define('User', {
    email: {
     type: DataTypes.STRING,
     allowNull: false,
     unique: true,
     validate: {
      notEmpty: true,
      isEmail: {
      msg: 'invalid email address' 
      },
       len: {
        args: [5, 255],
        msg: 'email is too long' 
       }
    }
  },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
            args: [3, 100],
            msg:'the username must between 3 and 100 characters long',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate:{ 
         notEmpty: true,
         len: {
             args:[6,100],
             msg:"the password must between 6 and 100 characters long",
         },
    },
  },
  }, {
    tableName: 'User', 
    timestamps: true  
  });
} 