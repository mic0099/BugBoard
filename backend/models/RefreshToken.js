import { DataTypes } from "sequelize";

export function createModel(database){
    database.define('RefreshToken',{
        tokenId: {
            type: DataTypes.INTEGER, 
            autoIncrement:true,
            primaryKey:true,
        },
        token: {
            type: DataTypes.STRING, 
            allowNull:false, 
            unique:true,
        }, 
        expiresAt:{
            type: DataTypes.DATE, 
            allowNull:false,
        }, 
        userId:{
            type: DataTypes.INTEGER, 
            allowNull: false, 
            references: {
                model: 'User',
                key: 'userId',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
            
        }
    },{
        tableName:'RefreshToken',
    });
}