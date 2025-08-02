import Order from "../models/order.js";
import Item from "../models/item.js";
import User from "../models/user.js";
import {nanoid} from "nanoid";

class OrderService {
    async createOrder({ userId, orderDetails }) {
        if (!orderDetails || orderDetails.length === 0) {
            throw new Error('Order must contain at least one item.');
        }

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        let totalAmount = 0;
        const populatedDetails = [];

        for (const detail of orderDetails) {
            const item = await Item.findById(detail.itemId);
            if (!item) throw new Error(`Item with ID ${detail.itemId} not found`);

            if (item.quantity < detail.quantity) {
                throw new Error(`Not enough quantity for item: ${item.name}`);
            }

            // Deduct quantity
            item.quantity -= detail.quantity;
            await item.save();

            const price = item.price;
            totalAmount += price * detail.quantity;

            populatedDetails.push({
                itemId: item._id,
                quantity: detail.quantity,
                price,
            });
        }

        const claimCode = nanoid(8); // Example: "U2FsdGVk"

        const order = await Order.create({
            userId: user._id,
            customerName: user.name, // optional field, can be skipped if unnecessary
            orderDetails: populatedDetails,
            totalAmount,
            claimCode,
        });

        return order;
    }

    async getOrderById(orderId) {
        return Order.findById(orderId)
            .populate('userId', 'name email')
            .populate('orderDetails.itemId');
    }

    async getOrderByClaimCode(claimCode) {
        return Order.findOne({ claimCode })
            .populate('userId', 'name email')
            .populate('orderDetails.itemId');
    }

    async markOrderAsClaimed(claimCode) {
        const order = await Order.findOne({ claimCode });
        if (!order) throw new Error('Invalid claim code');
        if (order.isClaimed) throw new Error('Order already claimed');

        order.isClaimed = true;
        return await order.save();
    }

    async getAllOrders() {
        return Order.find()
            .populate('userId', 'name email')
            .populate('orderDetails.itemId');
    }

    async getOrdersByUser(userId) {
        return Order.find({ userId })
            .sort({ createdAt: -1 })
            .populate('orderDetails.itemId');
    }
}

export default OrderService;