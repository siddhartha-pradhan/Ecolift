import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'UserProfile',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const Subscription = mongoose.model('Subscription', schema);

export default Subscription;