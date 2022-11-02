'use strict';
const UserModel = require('./index').user;

module.exports = (sequelize, DataTypes) => {
    const connection = sequelize.define('connection', {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: UserModel,
                key: 'id',
            }
        },
        latitude: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on category icon"
                }
            }
        },
        longitude: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on category icon"
                }
            }
        },
        fcm_token: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on category icon"
                }
            }
        }
    }, {});


    connection.associate = function(models) {
        // associations can be defined here
        connection.belongsTo(models.user, { foreignKey: 'user_id' });
    };


    return connection;
};