import RideHistory from '../models/ridehistory.js';
import DatabaseError from '../models/error.js';

class RideHistoryService {
  static async list() {
    try {
      return RideHistory.find();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await RideHistory.findOne({ _id: id }).exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      const obj = new RideHistory(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await RideHistory.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      const result = await RideHistory.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default RideHistoryService;