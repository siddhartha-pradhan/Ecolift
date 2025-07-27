import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 100,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    }
}, {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
