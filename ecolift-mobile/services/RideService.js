import { RIDE_STATUSES } from "../screens/User Screens/MainScreen";
import api from "./Api";

class RideService {
  static async createRide(rideData) {
    try {
      const response = await api.post("/ride", rideData);
      return response.data;
    } catch (error) {
      console.error("Error creating ride:", error);
      throw error;
    }
  }

  static async acceptRide(rideId, driverId) {
    try {
      if (!driverId) {
        throw new Error("Driver is required");
      }
      const response = await api.post(`/ride/${rideId}/accept`, {
        driverUserId: driverId,
      });
      return response.data;
    } catch (error) {
      console.error("Error accepting ride:", error);
      throw error;
    }
  }

    static async declineRide(rideId, driverUserId) {
    try {
      if (!driverUserId) {
        throw new Error("Driver is required");
      }
      const response = await api.post(`/ride/${rideId}/ignore`, {
        driverUserId: driverUserId,
      });
      return response.data;
    } catch (error) {
      console.error("Error declining ride:", error);
      throw error;
    }
  }

  static async getDeclineRides(driverUserId) {
    try {
     
      const response = await api.get(`/ride/ignore/driver/${driverUserId}`, {
        driverUserId: driverUserId,
      });
      return response.data;
    } catch (error) {
      console.error("Error declining ride:", error);
      throw error;
    }
  }

   static async requestRide(rideId, driverId) {
    try {
      if (!driverId) {
        throw new Error("Driver is required");
      }
      const response = await api.post(`/ride/${rideId}/request`, {
        driverId: driverId,
      });
      return response.data;
    } catch (error) {
      console.error("Error accepting ride:", error);
      throw error;
    }
  }

  static async completeRide(rideId, driverUserId) {
    try {
      const response = await api.post(`/ride/${rideId}/complete`, {
        driverUserId: driverUserId,
      });
      return response.data;
    } catch (error) {
      console.error("Error completing ride:", error);
      throw error;
    }
  }

  static async cancelRide(rideId, driverUserId) {
    try {
      const response = await api.put(`/ride/${rideId}/cancel`, {
        driverUserId: driverUserId,
      });
      return response.data;
    } catch (error) {
      console.error("Error cancelling ride:", error);
      throw error;
    }
  }

  static async getRideDetails(rideId) {
    try {
      const response = await api.get(`/ride/${rideId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ride details:", error);
      throw error;
    }
  }

  static async cancelAllRides(userId) {
    try {
      const response = await api.put(`/ride/cancel-all}`, { userId });
      return response.data;
    } catch (error) {
      console.error("Error cancelling rides", error);
      throw error;
    }
  }

  static async getRides() {
    try {
      const response = await api.get("/ride");
      return response.data;
    } catch (err) {
      console.error("Error getting rides");
    }
  }
  static async getRideHistory(userId) {
    try {
      const response = await api.get(`/ride/user/${userId}`);
      const updatedResponse = response.data?.filter(
        (val) => val.status === RIDE_STATUSES.COMPLETED
      );
      return updatedResponse;
    } catch (err) {
    }
  }

  static async getRideHistoryForDriver(driverUserId) {
    try {
      const response = await api.get(`/ride/driver/${driverUserId}`);
      const updatedResponse = response.data?.filter(
        (val) => val.status === RIDE_STATUSES.COMPLETED
      );
      return updatedResponse;
    } catch (err) {
    }
  }

  static async updateRideStatus(rideId, status) {
    try {
      const response = await api.post(`/ride/${rideId}/status`, {
        newStatus: status,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating ride status:", error);
      throw error;
    }
  }
}

export default RideService;
