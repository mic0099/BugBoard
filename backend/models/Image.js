import { DataTypes } from 'sequelize';  

export function createModel(database){
    database.define('Image',{
        imageId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            validate: {
                isUrl: true,
                notEmpty: true
            }

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
        tableName: 'Image',
        timestamps: true
    });
}