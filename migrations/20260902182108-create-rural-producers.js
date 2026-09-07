'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rural_producers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      document: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      document_type: {
        type: Sequelize.ENUM('cpf', 'cnpj'),
        allowNull: false,
      },
      producer_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rural_producers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rural_producers_document_type";');
  },
};
