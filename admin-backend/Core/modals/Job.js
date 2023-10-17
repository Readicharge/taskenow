const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  job: {
    id: {type: String},
    status: {
      technician: {type: String, default: "Pending"},
      customer: {type: String, default: "Pending"}
    },
    cost: {type: Number},
    type: {type: String},
    dateCreated: {type: Date},
    dateModified: {type: Date},
    description: {type: String},
    time_start: {type: String},
    time_end: {type: String},
    dateOfJob: {type: Date}
  },
  technician: {
    distance: {type: Number, default: 0},
    rating: {type: Number, default: 3},
    email: {type: String},
    id: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    phone: {type: String},
    paymentStatus: {
      released: {type: Boolean, default: false},
      releaseDate: {type: Date},
      amount: {type: Number, default: 0}
    }
  },
  customer: {
    addressLine1: {type: String},
    addressLine2: {type: String},
    city: {type: String},
    email: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    paymentId: {type: String},
    paymentStatus: {type: String, default: "Pending"},
    state: {type: String},
    zip: {type: String}
  }
});
const Booking = mongoose.model('jobs', bookingSchema);
module.exports = Booking;
