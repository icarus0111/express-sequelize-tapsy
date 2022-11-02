'use strict';

const JobModel = require('./index').jobs;

module.exports = (sequelize, DataTypes) => {
    const job_review = sequelize.define('job_review', {
        job_id: {
            type: DataTypes.INTEGER,
            references: {
                model: JobModel,
                key: 'id',
            }
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: {
                    args: true,
                    msg: "Rating value should not be empty"
                },
                not: {
                    args: ["^[a-z]+$", 'i'],
                    msg: "Only numbers are allowed on Rating value"
                }
            }
        },
        review: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }
    }, {});
    job_review.associate = function(models) {
        // associations can be defined here
    };
    return job_review;
};