import { DataTypes } from "sequelize";

export function createModel(database){
    database.define('RefreshToken',{
        id: {
            type: DataTypes.INTEGER, 
            autoincrement:true,
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
        userName:{
            type:DataTypes.STRING, 
            allowNull:false, 
        }
    },{
        tableName:'RefreshToken',
    });
}