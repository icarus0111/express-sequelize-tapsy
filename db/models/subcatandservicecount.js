'use strict';
module.exports = (sequelize, DataTypes) => {
    const subcatandservicecount = sequelize.define('subcatandservicecount', {
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on category id."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        no_of_sub_categorys: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on sub-category count"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        no_of_services: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on service count"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        }
    }, {});
    subcatandservicecount.associate = function(models) {
        // associations can be defined here
    };
    return subcatandservicecount;
};