import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
    unique: true,
    ref: 'User',
  },
  vehicleDetails: {
    type: String,
    required: true,
    maxLength: 255,
  },
  licenseImage: {
    type: String,
  },
  bluebookImage: {
    type: String,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  availableStatus:{
    type: String,
    enum: ['available', 'booked', 'offline'],
    default: 'available'
  }
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);
schema.virtual('adminVerification', {
  ref: 'AdminVerification',
  localField: '_id',
  foreignField: 'driver',
  justOne: true, // if one-to-one
});

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

const Driver = mongoose.model('Driver', schema);

export default Driver;