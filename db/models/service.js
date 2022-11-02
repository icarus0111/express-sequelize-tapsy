'use strict';
const CategoryModel = require('./index').category;

module.exports = (sequelize, DataTypes) => {
    const service = sequelize.define('service', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
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
            },
            references: {
                model: CategoryModel,
                key: 'id',
            }
        },
        sub_category_id: {
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
            },
            references: {
                model: CategoryModel,
                key: 'id',
            }
        },
        service_icon: {
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
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on price."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on price"
                }
            }
        },
        price_2: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on price."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on price"
                }
            }
        },
        price_3: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "letters are not allowed on price."
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on price"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        }
    }, {});
    service.associate = function(models) {
        // associations can be defined here
        service.belongsTo(models.category, { as: 'sub_category', foreignKey: 'sub_category_id' });
        service.belongsTo(models.category, { as: 'category_name', foreignKey: 'category_id' });
    };
    return service;
};