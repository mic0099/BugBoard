import { DataTypes } from "sequelize";


export function createModel(database){
  database.define('Comment',{
    commentId: {
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
        }
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        tableName: 'User',
        key: 'userId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Issue',
        key: 'issueId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'Comment',
    timestamps:true,
  }

);


};