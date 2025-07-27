import AdminVerification from '../models/adminverification.js';
import DatabaseError from '../models/error.js';
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Driver from "../models/driver.js";

class AdminVerificationService {
  static async list() {
    try {
      return AdminVerification.find();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await AdminVerification.findOne({ _id: id }).exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async sendRejectionEmail(driverId) {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASS
      }
    });

    const driver = await Driver.findOne({ _id:driverId }).populate("user").exec();
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: driver.user.email,
      subject: 'Driver Rejected',
      text: `You are rejected to be a driver. Please contact the support email ecolift@gmail.com!!`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', email);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }


  static async getByDriver(id) {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      return await AdminVerification.findOne({ driver: objectId }).exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }


  static async create(data) {
    try {
      const obj = new AdminVerification(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await AdminVerification.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      const result = await AdminVerification.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new DatabaseError(err);
    }
  }
}

export default AdminVerificationService;