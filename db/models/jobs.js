'use strict';
const UserModel = require('./index').user;
const ServiceModel = require('./index').service;
const JobStatusModel = require('./index').job_statu;
const paymentDetailsModel = require('./index').payment_detail;

module.exports = (sequelize, DataTypes) => {

    const jobs = sequelize.define('jobs', {
        customer_id: {
            type: DataTypes.INTEGER,
            references: {
                model: UserModel,
                key: 'id',
            }
        },

        vendor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: UserModel,
                key: 'id',
            }
        },

        service_id: {
            type: DataTypes.INTEGER,
            references: {
                model: ServiceModel,
                key: 'id',
            }
        },

        details: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Details should not be empty"
                }
            }
        },

        is_allocated: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0
        },

        imageName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Image name should not be empty"
                }
            }
        },

        date: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Date should not be empty"
                }
            }
        },

        time: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Time should not be empty"
                }
            }
        },

        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Price should not be empty"
                },
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed"
                }
            }
        },

        job_status: {
            type: DataTypes.INTEGER,
            references: {
                model: JobStatusModel,
                key: 'id',
            }
        },

        job_note: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Job note should not be empty"
                }
            }
        },

        address: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Address should not be empty"
                }
            }
        },

        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1
        },

        cancel_status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },

        is_scheduled: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },

        is_reviewed_scheduled_job: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },

        job_accept_start_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },

        job_accept_end_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {});

    jobs.associate = function(models) {
        // associations can be defined here
        jobs.belongsTo(models.user, { as: 'customer_details', foreignKey: 'customer_id' });
        jobs.belongsTo(models.user, { as: 'vendor_details', foreignKey: 'vendor_id' });
        jobs.belongsTo(models.service, { as: 'service_details', foreignKey: 'service_id' });
        jobs.belongsTo(models.job_statu, { as: 'status_details', foreignKey: 'job_status' }); //, targetKey: 'id'
        jobs.belongsTo(models.payment_detail, { as: 'payment_details', foreignKey: 'id', targetKey: 'job_id' }); //, targetKey: 'id'
    };

    return jobs;
};