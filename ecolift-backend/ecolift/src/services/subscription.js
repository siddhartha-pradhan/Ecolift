import Subscription from '../models/subscription.js';
import DatabaseError from '../models/error.js';

class SubscriptionService {
  static async list() {
    try {
      return Subscription.find();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await Subscription.findOne({ _id: id }).exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      const obj = new Subscription(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Subscription.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      const result = await Subscription.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default SubscriptionService;