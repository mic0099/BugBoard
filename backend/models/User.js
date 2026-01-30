import { DataTypes } from "sequelize" 

//gestire formattazione password e gestione spazi stringhe
export function createModel(database) { 
  database.define('User', {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
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
        args: [6, 254],
        msg: 'email is too long' 
       }
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
          args: [3, 30],
          msg:'the name must between 3 and 30 characters long',
      },
    },
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: {
          args: [3, 30],
          msg:'the surname must between 3 and 30 characters long',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate:{ 
      notEmpty: true,
      len: {
        args:[8,64],
        msg:"the password must between 8 and 64 characters long",
      },
    },
  },
  admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  }, {
    tableName: 'User', 
    timestamps: true  
  });
} 