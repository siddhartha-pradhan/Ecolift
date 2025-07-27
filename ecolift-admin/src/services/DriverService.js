import axios from "../utils/axios/axios";

class DriverService {
  static Approve = "Approved";
  static Reject = "Rejected";
  static async getDrivers() {
    try {
      const response = await axios.get("/driver");
      return response.data;
    } catch (err) {
      throw err; // Rethrow the error to be handled by the calling function
    }
  }

static async getPendingRiders() {
  try {
    const response = await this.getDrivers(); // assume this returns { data: Driver[] }
    const adminVerification = await axios.get("/admin-verification"); // assume this returns { data: VerifiedDriver[] }

    const verifiedDriverIds = new Set(adminVerification.data.map(v => v.driver)); // Assuming `dr` is the driver's ID
    const pendingRiders = response.filter(driver =>
      !verifiedDriverIds.has(driver._id) && driver.isVerified === false
    );


    return pendingRiders;
  } catch (err) {
    console.log(err)
    throw err; // Let the caller handle the error
  }
}


  static async approveOrRejectDriver(updatedRider) {
    try {

        await Promise.all([
        //   axios.put(`/driver/${updatedRider._id}`, {
        //     ...updatedRider,
        //     isVerified: true,
        //   }),
          axios.post("/admin-verification", {
            driver: updatedRider._id,
            status: updatedRider?.isVerified ? this.Approve : this.Reject,
            submittedAt: updatedRider?.createdAt,
          }),
        ]);
    } catch (err) {
      throw err; // Rethrow the error to be handled by the calling function
    }
  }

  static async updatedRider(updatedRider) {
    try {
      await axios.put(`/driver/${updatedRider.id}`, {
        ...updatedRider,
      });
    } catch (err) {
      throw err; // Rethrow the error to be handled by the calling function
    }
  }
}

export default DriverService;
