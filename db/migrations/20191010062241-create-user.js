'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING(60)
            },
            email: {
                defaultValue: null,
                allowNull: true,
                type: Sequelize.STRING(50)
            },
            phone: {
                allowNull: false,
                type: Sequelize.BIGINT(11),
                unique: true
            },
            username: {
                allowNull: false,
                unique: true,
                type: Sequelize.STRING(30)
            },
            password: {
                allowNull: false,
                type: Sequelize.STRING
            },

            role_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'roles',
                        schema: 'schema'
                    },
                    key: 'id'
                },
                allowNull: false
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },

            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Users');
    }
};