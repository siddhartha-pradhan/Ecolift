import Ride, { RIDE_STATUSES } from "../models/ride.js";
import DatabaseError from "../models/error.js";
import UserProfileService from "./userprofile.js";
import { getConnectedUsers, getIO } from "../../socket.js";
import DriverService from "./driver.js";
import RideHistoryService from "./ridehistory.js";
import UserService from "./user.js";
import IgnoredRides from "../models/ignoredrides.js";
import User from "../models/user.js";
import mongoose from 'mongoose';
import UserProfile from "../models/userprofile.js";

class RideService {
  static async list() {
    try {
      return Ride.find()
        .populate({
          path: "userProfile", // Ride.user refers to UserProfile
          populate: {
            path: "user", // UserProfile.user refers to User
            model: "User",
          },
        })
        .populate("driver");
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async listByUser(userId) {
    try {
      const rides = await Ride.find()
        .populate({
          path: "userProfile",
          populate: {
            path: "user",
            model: "User",
          },
        })
        .populate("driver");

      // Filter rides based on userProfile.user._id
      const userRides = rides.filter(
        (ride) =>
          ride.userProfile &&
          ride.userProfile.user &&
          ride.userProfile.user._id.toString() === userId.toString()
      );

      return userRides;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async listByDriver(driverUserId) {
    try {
      const rides = await Ride.find()
        .populate({
          path: "userProfile",
          populate: {
            path: "user",
            model: "User",
          },
        })
        .populate({
          path: "driver",
          populate: {
            path: "user",
            model: "User",
          },
        });

      // Filter rides based on userProfile.user._id
      const driverRides = rides.filter(
        (ride) =>
          ride.driver &&
          ride.driver.user &&
          ride.driver.user._id.toString() === driverUserId.toString()
      );
      return driverRides;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async get(id) {
    try {
      return await Ride.findOne({ _id: id })
        .populate({
          path: "userProfile", // Ride.user refers to UserProfile
          populate: {
            path: "user", // UserProfile.user refers to User
            model: "User",
          },
        })
        .populate("driver")
        .exec();
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async create(data) {
    try {
      const obj = new Ride(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async update(id, data) {
    try {
      return await Ride.findOneAndUpdate({ _id: id }, data, {
        new: true,
        upsert: false,
      });
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async delete(id) {
    try {
      const result = await Ride.deleteOne({ _id: id }).exec();
      return result.deletedCount === 1;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async accept(id, driverUserId) {
    try {
      if (!driverUserId) {
        throw new Error("Driver is required");
      }
      const ride = await Ride.findOne({ _id: id });
      const userProfile = await UserProfileService.get(ride.userProfile);
      // if (userProfile.freeRidesRemaining > 0) {
      //   await UserProfileService.update(userProfile._id, {
      //     freeRidesRemaining: userProfile.freeRidesRemaining - 1,
      //   });
      // }
      const userId = userProfile.user.toString();
      const connectedUsers = getConnectedUsers();
      const io = getIO();
      const socketId = connectedUsers.get(userId);
      const driver = await DriverService.getByUser(driverUserId);

      const updated = await Ride.findOneAndUpdate(
        { _id: id, status: RIDE_STATUSES.REQUESTED },
        { status: RIDE_STATUSES.ACCEPTED, driver: driver._id },
        { new: true }
      );
      if (socketId) {
        io.to(socketId).emit("rideAccepted", {
          rideId: ride._id,
          message: "Your ride request has been accepted!",
          driverId: driver._id,
        });
        console.log(`Notified user ${userId}`);
      }
      return updated;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async requestRide(id, driverId) {
    try {
      const ride = await Ride.findOne({ _id: id })
        .populate({
          path: "userProfile",
          populate: {
            path: "user",
            model: "User",
          },
        })
        .exec();
      const driver = await DriverService.get(driverId);
      const driverUserId = driver.user._id.toString();
      const connectedUsers = getConnectedUsers();
      const io = getIO();
      const socketId = connectedUsers.get(driverUserId);
      // Emit a socket event to the driver (assuming room or socketId is driverId)
      if (socketId) {
        io.to(socketId).emit("rideRequested", {
          ride: ride,
          message: "Your ride has been requested!",
        });
        console.log(
          `Ride request sent to driver ${driverId} for ride ${ride._id}`
        );
      }
    } catch (err) {
      console.error("Error sending ride request via socket:", err);
      throw err;
    }
  }

  static async cancel(id, driverUserId) {
    try {
      const ride = await Ride.findOne({ _id: id });
      if (!ride) {
        throw new Error("Ride not found");
      }

      //Check for the ride status and driver
      if (ride.status === RIDE_STATUSES.COMPLETED) {
        throw new Error("Cannot cancel a completed ride");
      }
      const userProfile = await UserProfileService.get(ride.userProfile);

      if (driverUserId && (ride.status === RIDE_STATUSES.ACCEPTED || ride.status === RIDE_STATUSES.STARTED)) {
        const rideModel = await Ride.findById(id)
            .populate('driver')  // ✅ this fetches full driver document
            .lean();

        const userModel = await User.findById(
            new mongoose.Types.ObjectId(rideModel.driver.user)
        ).lean();


        const driverUserProfile = await UserProfile.findOne({
          user: userModel._id
        }).lean();

        const updatedUserProfile = await UserProfile.findByIdAndUpdate(
            driverUserProfile._id,
            { $inc: { redeemPoints: -5 } }, // Decrease redeemPoints by 5
            { new: true, runValidators: true }
        );

        if (userProfile.freeRidesRemaining > 0) {
          await UserProfileService.update(userProfile._id, {
            freeRidesRemaining: userProfile.freeRidesRemaining + 1,
          });
        }
      }
      const userId = userProfile.user.toString();
      const io = getIO();
      const connectedUsers = getConnectedUsers();
      const socketId = connectedUsers.get(userId);

      const updatedRide = await Ride.findOneAndUpdate(
        {
          _id: id,
          status: { $in: [RIDE_STATUSES.REQUESTED, RIDE_STATUSES.ACCEPTED] },
        }, // Allow cancel from REQUESTED or ACCEPTED
        { status: RIDE_STATUSES.CANCELED },
        { new: true }
      );

      if (!updatedRide) {
        throw new Error("Ride cancellation failed. Invalid ride status.");
      }

      if (socketId) {
        io.to(socketId).emit("rideCancelled", {
          // Corrected event name to 'rideCancelled'
          rideId: ride._id,
          message: "Your ride has been cancelled.", // improved message.
        });
        console.log(`Notified user ${userId}`);
      }
      return updatedRide;
    } catch (err) {
      throw new Error(err); // Re-throw for centralized handling
    }
  }

  static async cancelAllByUser(userId) {
    try {
      return await Ride.updateMany(
        {
          user: userId,
          status: RIDE_STATUSES.REQUESTED,
        },
        {
          $set: { status: RIDE_STATUSES.CANCELED },
        }
      );
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async complete(id, driverUserId) {
    try {
      if (!driverUserId) {
        throw new Error("Driver is required");
      }
      const ride = await Ride.findOne({ _id: id }); // Ensure driver matches
      if (!ride) {
        throw new Error("Ride not found or not assigned to this driver");
      }

      const userUserProfile = await UserProfileService.get(ride.userProfile);
      const userId = userUserProfile.user.toString(); // Get user ID as string
      const io = getIO();
      const connectedUsers = getConnectedUsers();
      const socketId = connectedUsers.get(userId);
      const driver = await DriverService.getByUser(driverUserId);
      const driverUserProfile = await UserProfileService.getByUser(driver.user);

      const driverId = driver._id.toString();
      const updatedRide = await Ride.findOneAndUpdate(
        { _id: id, status: RIDE_STATUSES.STARTED, driver: driverId }, // Added driver check
        { status: RIDE_STATUSES.COMPLETED },
        { new: true }
      );

      if (!updatedRide) {
        throw new Error("Ride completion failed.  Incorrect status or driver.");
      }
      const userProfileUpdateData = {
        redeemPoints:
          userUserProfile.redeemPoints + Math.ceil(updatedRide.distance),
      };
      const driverProfileUpdateData = {
        redeemPoints:
          driverUserProfile.redeemPoints + Math.ceil(updatedRide.distance),
      };
      await UserProfileService.update(
        userUserProfile._id,
        userProfileUpdateData
      );
      await UserProfileService.update(
        driverUserProfile._id,
        driverProfileUpdateData
      );
      if (socketId) {
        io.to(socketId).emit("rideCompleted", {
          // Changed event name
          rideId: ride._id,
          message: `Ride has been completed, Succesfully earned ${updatedRide.distance} reedem points`,
        });

        console.log(`Notified user ${userId}`);
      }
      return updatedRide;
    } catch (err) {
      throw new Error(err); // Re-throw the error for centralized handling
    }
  }

  static async ignoreRide(rideId, driverUserId) {
    try {
      const driver = await DriverService.getByUser(driverUserId);
      if (!driver) {
        throw new Error("Driver not found");
      }
      const data = {
        ride: rideId,
        driver: driver._id,
      };
      const obj = new IgnoredRides(data);
      await obj.save();
      return obj;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async getIgnoredRides(driverUserId) {
    try {
      const driver = await DriverService.getByUser(driverUserId);
      if (!driver) {
        throw new Error("Driver not found");
      }
      const ignoredRides = await IgnoredRides.find({ driver: driver._id });
      return ignoredRides;
    } catch (err) {
      throw new DatabaseError(err);
    }
  }

  static async updateRideStatus(rideId, newStatus) {
    try {
      const validStatuses = [RIDE_STATUSES.STARTED, RIDE_STATUSES.REACHED];
      if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status update request.");
      }

      const ride = await Ride.findById(rideId).populate({
        path: "userProfile",
        populate: {
          path: "user",
          model: "User",
        },
      });

      if (!ride) throw new Error("Ride not found");

      const updatedRide = await Ride.findByIdAndUpdate(
          rideId,
          { status: newStatus },
          { new: true }
      );

      const userId = ride.userProfile.user._id.toString();

      const io = getIO();
      const socketId = getConnectedUsers().get(userId);


      if (socketId) {
        io.to(socketId).emit("rideStatusUpdated", {
          rideId: rideId,
          status: newStatus,
          message: `Your ride status is now "${newStatus}".`,
        });
        console.log(`Sent status update (${newStatus}) to user ${userId}`);
      }

      return updatedRide;
    } catch (err) {
      throw new Error(err.message || "Error updating ride status.");
    }
  }
}

export default RideService;
