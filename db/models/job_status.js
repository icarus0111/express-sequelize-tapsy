'use strict';
module.exports = (sequelize, DataTypes) => {
    const job_status = sequelize.define('job_statu', {
        status_name: DataTypes.STRING,
        active: DataTypes.STRING
    }, {});
    job_status.associate = function(models) {
        // associations can be defined here
        job_status.belongsTo(models.jobs, { as: 'status_details', foreignKey: 'id' });
    };
    return job_status;
}