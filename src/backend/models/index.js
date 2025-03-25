const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const dotenv = require('dotenv');

dotenv.config();

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'e_rickshaw_booking',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to false to reduce console output
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Initialize db object
const db = {};

// Add sequelize instance and Sequelize class to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import Driver model first
db.Driver = require('./Driver')(sequelize, DataTypes);

// Read all other model files and add them to the db object
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && 
      file !== basename && 
      file.slice(-3) === '.js' &&
      file !== 'Driver.js' // Skip Driver.js as it's already imported
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Create model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sync database with alter: true to update existing tables
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
  });

module.exports = db; 