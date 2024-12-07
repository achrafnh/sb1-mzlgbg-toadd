const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lawyer = sequelize.define('lawyers', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  specialization: {
    type: DataTypes.STRING
  },
  years_of_experience: {
    type: DataTypes.INTEGER
  },
  phone_number: {
    type: DataTypes.STRING(20)
  },
  profile_image: {
    type: DataTypes.STRING
  },
  office_address: {
    type: DataTypes.TEXT
  },
  bio: {
    type: DataTypes.TEXT
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  languages_spoken: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended'),
    defaultValue: 'pending'
  },
  refresh_token: {
    type: DataTypes.TEXT
  },
  last_login: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Lawyer;