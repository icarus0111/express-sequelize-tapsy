'use strict';
module.exports = (sequelize, DataTypes) => {
    const brand = sequelize.define('brand', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                message: 'Brand already exist',
            },
            validate: {
                is: {
                    args: ["^[a-z ]+$", 'i'],
                    msg: "Only letters are allowed"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on name"
                }
            }
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on description"
                }
            }
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on logo"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        }
    }, {});
    brand.associate = function(models) {
        // associations can be defined here
        brand.hasMany(models.model, { as: 'brand_details', foreignKey: 'brand_id' });
    };
    return brand;
};