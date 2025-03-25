module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Making it optional for existing drivers
      defaultValue: null
    },
    status: {
      type: DataTypes.ENUM('available', 'busy', 'offline'),
      defaultValue: 'available'
    }
  }, {
    timestamps: true,
    tableName: 'drivers'
  });

  Driver.associate = (models) => {
    Driver.hasMany(models.Booking, {
      foreignKey: 'driverId',
      as: 'bookings'
    });
  };

  return Driver;
}; 