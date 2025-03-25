module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
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
      allowNull: false
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    pickupTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'assigned', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Drivers',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    tableName: 'bookings'
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver'
    });
  };

  return Booking;
}; 