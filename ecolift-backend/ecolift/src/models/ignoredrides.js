import mongoose from 'mongoose';

import { handleDuplicateKeyError } from './error.js';

const schema = new mongoose.Schema({
    driver: {
        type: mongoose.ObjectId,
        required: true,
        unique: true,
        ref: 'User',
    },
    ride:{
        type: mongoose.ObjectId,
        required: true,
        unique: true,
        ref: 'Ride',
    }
}, {
    versionKey: false,
});

schema.post('save', handleDuplicateKeyError);
schema.post('update', handleDuplicateKeyError);
schema.post('findOneAndUpdate', handleDuplicateKeyError);
schema.post('insertMany', handleDuplicateKeyError);

schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });

const IgnoredRides = mongoose.model('IgnoredRides', schema);

export default IgnoredRides;