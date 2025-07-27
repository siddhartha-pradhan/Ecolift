import Item from '../models/item.js';
import DatabaseError from '../models/error.js';
import UserProfile from "../models/userprofile.js";

class ItemService {
    static async list() {
        try {
            return await Item.find(); // populate virtual adminVerification
        } catch (err) {
            throw new DatabaseError(err);
        }
    }

    static async get(id) {
        try {
            return await Item.findOne({ _id: id }).exec();
        } catch (err) {
            throw new DatabaseError(err);
        }
    }

    static async create(data) {
        try {
            const obj = new Item(data);
            await obj.save();
            return obj;
        } catch (err) {
            throw new DatabaseError(err);
        }
    }

    static async update(id, data) {
        try {
            return await Item.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
        } catch (err) {
            throw new DatabaseError(err);
        }
    }

    static async delete(id) {
        try {
            const result = await Item.deleteOne({ _id: id }).exec();
            return (result.deletedCount === 1);
        } catch (err) {
            throw new DatabaseError(err);
        }
    }

    static async reduceRedeemPoints(userId, amount) {
        if (!userId || !amount || isNaN(amount) || amount <= 0) {
            throw new DatabaseError("Invalid userId or amount");
        }

        try {
            console.log(userId);
            const userProfile = await UserProfile.findOne({ user: userId }).exec();
            if (!userProfile) {
                throw new DatabaseError("UserProfile not found");
            }

            if (userProfile.redeemPoints < amount) {
                throw new DatabaseError("Not enough redeem points");
            }

            userProfile.redeemPoints -= amount;
            await userProfile.save();

            return userProfile;
        } catch (err) {
            throw new DatabaseError(err);
        }
    }
}

export default ItemService;