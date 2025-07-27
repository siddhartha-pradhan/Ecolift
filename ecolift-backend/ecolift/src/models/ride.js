import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

// Status values could be:
export const RIDE_STATUSES = {
  REQUESTED: 'requested', // when user books
  ACCEPTED: 'accepted',   // when driver accepts
  STARTED: 'started',     // when driver starts the ride
  COMPLETED: 'completed',
  CANCELED: 'canceled'
};


const schema = new mongoose.Schema({
  userProfile: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'UserProfile',
  },
  pickupLocation: {
    type: String,
    required: true,
    maxLength: 255,
  },
  dropoffLocation: {
    type: String,
    required: true,
    maxLength: 255,
  },
  vehicleType: {
    type: String,
    required: true,
    maxLength: 255,
  },
  distance: {
    type: Number,
    required: true,
  },
  isPreBooked: {
    type: Boolean,
    required: true,
  },
  preBookedDate: {
    type: Date,
    required: true,
  },
  fare: {
    type: Number,
    required: true,
    validate: {
      validator: (val) => Math.floor(val) === val,
      message: 'An integer is required',
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['requested', 'accepted', 'completed', 'canceled'],
    default: 'requested'
  },

  driver: {
    type: mongoose.ObjectId,
    ref: 'Driver',
  },
  createdAt: {
    type: Date,
    required: true,
    default:new Date()
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const Ride = mongoose.model('Ride', schema);

export default Ride;