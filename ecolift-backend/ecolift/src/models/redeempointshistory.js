import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  driver: {
    type: mongoose.ObjectId,
    ref: 'Driver',
  },
  ride: {
    type: mongoose.ObjectId,
    ref: 'Ride',
  },
  points: {
    type: Number,
  },
  date: {
    type: Date,
  },
  type: {
    type: String,
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const RedeemPointsHistory = mongoose.model('RedeemPointsHistory', schema);

export default RedeemPointsHistory;