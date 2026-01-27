import { DataTypes } from "sequelize"; 
//gestire situazione noOnlyspace 

export function createModel(database){
    database.define('Tag',{
          id: {
             type: DataTypes.INTEGER, 
             autoIncrement: true,
             primaryKey: true,
             allowNull: false,
          },

          content: {
            type: DataTypes.STRING, 
            allowNull: false, 
            validate: {
                notEmpty:true,
                len: {
                args: [1,10] , 
                msg: 'The descriptive tag must contain between 1 and 20 characters',
            },
        },
    },

    },{
        tableName: 'Tag',
        timestamps:false, 
    },
);
}