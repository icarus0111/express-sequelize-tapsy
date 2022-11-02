'use strict';

const BrandModel = require('./index').brand;

module.exports = (sequelize, DataTypes) => {
    const model = sequelize.define('model', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on name"
                }
            }
        },

        image: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on name"
                }
            }
        },

        kd_compatibility: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on name"
                }
            }
        },

        category: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on name"
                }
            }
        },

        digital: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on name"
                }
            }
        },
        brand_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on brand id."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            },
            references: {
                model: BrandModel,
                key: 'id',
            }
        },
        start_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on start year."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            },
        },
        end_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on end year."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            },
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        }
    }, {});
    model.associate = function(models) {
        // associations can be defined here
        model.belongsTo(models.brand, { as: 'brand_details', foreignKey: 'brand_id' });
    };
    return model;
};