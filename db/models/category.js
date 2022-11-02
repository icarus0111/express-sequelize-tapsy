'use strict';
module.exports = (sequelize, DataTypes) => {
    const category = sequelize.define('category', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: {
                    args: ["^[a-z ]+$", 'i'],
                    msg: "Only letters are allowed on Name"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on Name"
                }
            }
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        category_icon: {
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
        sub_category_icon: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on sub-category icon"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        },
    }, {});
    category.associate = function(models) {
        // associations can be defined here
        category.hasOne(models.subcatandservicecount, { as: 'counts', foreignKey: 'category_id' });
        category.belongsTo(models.category, { as: 'parent_category', foreignKey: 'parent_id' });
        category.hasMany(models.service, { as: 'child_service', foreignKey: 'sub_category_id' });
    };
    return category;
};