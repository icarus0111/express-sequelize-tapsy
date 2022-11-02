'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const role = sequelize.define('role', {
        role_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.NUMBER,
            defaultValue: 1,
        }
    }, {});

    role.associate = function(models) {
        // associations can be defined here
        role.belongsTo(models.user)
    };

    return role;
};