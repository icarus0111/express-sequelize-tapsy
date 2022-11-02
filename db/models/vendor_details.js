'use strict';

const UserModel = require('./index').user;

module.exports = (sequelize, DataTypes) => {
    const vendor_details = sequelize.define('vendor_detail', {
        vendor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: UserModel,
                key: 'id',
            }
        },
        is_company: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Company should not be empty"
                }
            }
        },
        isTeamAdded: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Team added field should not be empty"
                }
            }
        },
        is_added_by_company: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Added by company field should not be empty"
                }
            }
        },
        businessName: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Business Name should not be empty"
                }
            }
        },
        abn: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "ABN should not be empty"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        },
    }, {});
    vendor_details.associate = function(models) {
        // associations can be defined here
    };
    return vendor_details;
};