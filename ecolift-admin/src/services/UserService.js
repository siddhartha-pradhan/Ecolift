import axios from "../utils/axios/axios";

class UserService {
  static async getUsers() {
    try {
      const response = await axios.get("/users");
      const onlyNormalUsers = response.data.filter((val)=>val.role === "Normal");
      return onlyNormalUsers;
    } catch (err) {
      throw err; // Rethrow the error to be handled by the calling function
    }
  }

    static async updateUser(id, user) {
    try {
      await axios.put(`/users/${id}`, user);
    } catch (err) {
      throw err; // Rethrow the error to be handled by the calling function
    }
  }


    static async getRiders() {
    try {
      const response = await axios.get("/users");
      return response.data.map((val)=>val.role === "Driver") ?? [];
    } catch (err) {
      throw err; // Rethrow the error to be handled by the calling function
    }
  }

  static async getUserCount(){
    try{
      const users =  this.getUsers();
      return users.length;
    }catch(err){

    }
  }
}

export default UserService;
