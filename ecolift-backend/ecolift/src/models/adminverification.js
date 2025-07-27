import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  driver: {
    type: mongoose.ObjectId,
    ref: 'Driver',
  },
  status: {
    type: String,
  },
  submittedAt: {
    type: Date,
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const AdminVerification = mongoose.model('AdminVerification', schema);

export default AdminVerification;