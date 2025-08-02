import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    customerName: {
        type: String,
        trim: true,
    },
    orderDetails: {
        type: [orderDetailSchema],
        required: true,
        validate: v => Array.isArray(v) && v.length > 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    claimCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    isClaimed: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
