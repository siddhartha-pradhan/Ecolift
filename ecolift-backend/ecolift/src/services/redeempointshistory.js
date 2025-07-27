import RedeemPointsHistory from '../models/redeempointshistory.js';
import DatabaseError from '../models/error.js';

class RedeemPointsHistoryService {
  static async list() {
    try {
      return RedeemPointsHistory.find();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await RedeemPointsHistory.findOne({ _id: id }).exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      const obj = new RedeemPointsHistory(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await RedeemPointsHistory.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      const result = await RedeemPointsHistory.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default RedeemPointsHistoryService;