import Driver from '../models/driver.js';
import DatabaseError from '../models/error.js';
import AdminVerification from "../models/adminverification.js";
import mongoose from "mongoose";

class DriverService {
  static async list() {
    try {
      return await Driver.find()
          .populate('user') // populate user
          .populate('adminVerification'); // populate virtual adminVerification
    } catch (err) {
      throw new DatabaseError(err);
    }
  }



  static async get(id) {
    try {
      return await Driver.findOne({ _id: id }).populate("user").exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async getByUser(id) {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      return await Driver.findOne({ user: objectId }).exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
  static async create(data) {
    try {
      const obj = new Driver(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Driver.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      const result = await Driver.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default DriverService;