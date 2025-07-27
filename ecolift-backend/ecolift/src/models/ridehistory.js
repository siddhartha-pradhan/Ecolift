import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  ride: {
    type: mongoose.ObjectId,
    required: true,
    unique: true,
    ref: 'Ride',
  },
  userProfile: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'UserProfile',
  },
  dateTaken: {
    type: Date,
    required: true,
  },
  redeemPointsEarned: {
    type: Number,
    required: true,
  },
  driver: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Driver',
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const RideHistory = mongoose.model('RideHistory', schema);

export default RideHistory;