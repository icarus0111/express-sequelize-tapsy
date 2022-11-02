'use strict';
const RoleModel = require('./index').role;
const CategoryModel = require('./index').category;
const StateModel = require('./index').states;
const vendorDetailModel = require('./index').vendor_detail;

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                is: {
                    args: ["^[a-z ]+$", 'i'],
                    msg: "Only letters are allowed on Name"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                message: 'Email already registered',
            },
            validate: {
                is: {
                    args: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                    msg: "Email is not valid."
                },
                isEmail: {
                    args: true,
                    msg: "Email is not valid"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty value not allowed on Email"
                }
            }
        },
        phone: {
            type: DataTypes.BIGINT(11),
            allowNull: false,
            unique: {
                args: true,
                message: 'Phone already registered',
            },
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Invalid phone number"
                },
                len: {
                    args: [9, 10],
                    msg: "Invalid phone number"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty value not allowed"
                }
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        suburb: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Suburb field should not be empty"
                }
            }
        },
        state: {
            type: DataTypes.INTEGER,
            references: {
                model: StateModel,
                key: 'id',
            }
        },
        post_code: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed"
                }
            }
        },
        otp_require: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Otp require field should not be empty"
                }
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty value not allowed"
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty value not allowed"
                }
            }
        },
        otp: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty value not allowed."
                },
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed"
                },
                len: {
                    args: [6, 6],
                    msg: "OTP should be 6 digits long"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0,
        },
        is_available: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed"
                }
            }
        },
        approved: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Empty value not allowed."
                },
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed"
                }
            }
        },
        role_id: {
            type: DataTypes.INTEGER,
            references: {
                model: RoleModel,
                key: 'id',
            }
        },
        details_id: {
            type: DataTypes.INTEGER,
            references: {
                model: vendorDetailModel,
                key: 'id',
            }
        },
        category_id: {
            type: DataTypes.INTEGER,
            references: {
                model: CategoryModel,
                key: 'id',
            }
        },
        added_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            validate: {
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed on added by field"
                },
                notEmpty: {
                    args: true,
                    msg: "Empty string not allowed on added by field"
                }
            }
        }
    }, {});
    user.associate = function(models) {
        // associations can be defined here
        user.hasOne(models.role, { foreignKey: 'role_id' });
        user.belongsTo(models.category, { as: 'category_details', foreignKey: 'category_id' });
        user.belongsTo(models.states, { as: 'state_details', foreignKey: 'state' });
        user.belongsTo(models.vendor_detail, { as: 'vendor_details', foreignKey: 'details_id' });
        user.belongsTo(models.connection, { as: 'conn_details', foreignKey: 'id', targetKey: 'user_id' });
    };
    return user;
};