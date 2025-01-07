const mongoose = require('mongoose');

const flightbookSchema = new mongoose.Schema({

    seat: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },

    fullName: {
        type: String,
        required: true,
    },

    dateBirth: {
        type: String,
        required: true,
    },

    nationality: {
        type: String,
        required: true,
    },

    passport: {
        type: String,
        required: true,
    },

    mobile: {
        type: String,
        required: true,
    },

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

const Flightbook = mongoose.model('Flightbook', flightbookSchema);

module.exports = Flightbook;