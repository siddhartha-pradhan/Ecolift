import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
  adImage: {
    type: String,
  },
  adDuration: {
    type: Number,
    validate: {
      validator: (val) => Math.floor(val) === val,
      message: 'An integer is required',
    },
  },
  isActive: {
    type: Boolean,
  },
}, {
  versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

const Advertisment = mongoose.model('Advertisment', schema);

export default Advertisment;