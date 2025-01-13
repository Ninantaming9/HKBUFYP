const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  ticketType: {
    type: String,
    required: true,
  },
  flightNumber: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  departureLocation: {
    type: String,
    required: true,
  },
  arrivalLocation: {
    type: String,
    required: true,
  },
  cabinClass: {
    type: String,
    required: true,
  },
  ticketPrice: {
    type: Number,
    required: true,
  }
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;