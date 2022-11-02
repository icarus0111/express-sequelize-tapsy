'use strict';

const UserModel = require('./index').user;
const JobModel = require('./index').jobs;

module.exports = (sequelize, DataTypes) => {
    const payment_detail = sequelize.define('payment_detail', {
        job_id: {
            type: DataTypes.INTEGER,
            references: {
                model: JobModel,
                key: 'id',
            }
        },
        charge_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Charge id should not be empty"
                }
            }
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 1,
        }
    }, {});
    payment_detail.associate = function(models) {
        // associations can be defined here
        payment_detail.belongsTo(models.jobs, { as: 'payment_details', foreignKey: 'job_id' });
    };
    return payment_detail;
};