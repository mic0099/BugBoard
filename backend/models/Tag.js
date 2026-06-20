import { DataTypes } from "sequelize"; 

export function createModel(database){
    database.define('Tag',{
        tagId: {
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
                    args: [1,20] , 
                    msg: 'The descriptive tag must contain between 1 and 20 characters'
                }
            }
        },

        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'User',
                key: 'userId'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    },{
        tableName: 'Tag',
        timestamps:false, 
    });
}