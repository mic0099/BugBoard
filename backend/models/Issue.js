import { DataTypes } from 'sequelize'

export function createModel(database){
    database.define('Issue', {
        issueId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: {
                    args: [3,15],
                    msg: 'Title must between 3 and 15 characters long' 
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: {
                    args: [10,200],
                    msg: 'Description must between 10 and 200 characters long'
                }
            }
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high', 'blocker'),
            allowNull: false

        },
        type: {
            type: DataTypes.ENUM('question', 'bug', 'documentation', 'feature'),
            allowNull: false

        },
        status: {
            type: DataTypes.ENUM('open', 'todo', 'in_progress', 'closed'), 
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                tableName: 'User',
                key: 'userId'
            },
            onUpdate: 'CASCADE',
           // onDelete: 'CASCADE'
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                tableName: 'Project',
                key: 'projectId'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    },{
        tableName: 'Issue',
        timestamps: true
    });
}