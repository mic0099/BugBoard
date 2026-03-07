import { DataTypes } from 'sequelize'

export function createModel(database){
    database.define('Project', {
        projectId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: {
                    args: [3,50],
                    msg: 'project name must between 3 and 10 characters long'
                }
            }
        }
    },{
        tableName: 'Project',
        timestamps: true
    });
}