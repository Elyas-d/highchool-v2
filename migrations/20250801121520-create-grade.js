'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('grades', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      assessment_type: {
        type: Sequelize.ENUM('exam', 'quiz', 'homework', 'project'),
        allowNull: false,
      },
      assessment_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      score: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
      },
      max_score: {
        type: Sequelize.DECIMAL(5,2),
        defaultValue: 100,
        allowNull: false,
      },
      percentage: {
        type: Sequelize.VIRTUAL(Sequelize.DECIMAL(5,2), ['score', 'max_score']),
        get() {
          return (this.score / this.max_score * 100).toFixed(2);
        }
      },
      graded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('grades');
  }
};
