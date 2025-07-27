import api from "./Api";

class DriverService {
  static async getDriver(id) {
    try {
      const response = await api.get(`/driver/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching ride details:", error);
      throw error;
    }
  }
  static async getDriverById() {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (err) {
      console.error(JSON.stringify(err));
    }
  }
}

export default DriverService;
