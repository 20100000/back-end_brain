'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('farm_crops', 'harvest', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    });

    await queryInterface.removeColumn('farms', 'harvest');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('farms', 'harvest', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    });
    await queryInterface.removeColumn('farm_crops', 'harvest');
  }
};
