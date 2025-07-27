import mongoose from 'mongoose';
import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
    unique: true,
    ref: 'User',
  },
  isPremium: {
    type: Boolean,
    required: true,
    default: false,
  },
  premiumExpiryDate: {
    type: Date,
    required: function () {
      return this.isPremium;
    },
  },
  freeRidesRemaining: {
    type: Number,
    required: true,
    default: function () {
      return this.isPremium ? 3 : 1; // Set initial value
    },
    validate: {
      validator: (val) => Number.isInteger(val),
      message: 'An integer is required',
    },
  },
  redeemPoints: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const UserProfile = mongoose.model('UserProfile', schema);

export default UserProfile;
