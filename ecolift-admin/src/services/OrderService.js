import axios from "../utils/axios/axios";

class OrderService {
    static async getAllOrders() {
        try {
            const response = await axios.get("/order");
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async getOrdersByUserId(userId) {
        try {
            const response = await axios.get(`/order/user/${userId}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async createOrder(orderData) {
        try {
            const response = await axios.post("/order", orderData);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async claimOrderByCode(claimCode) {
        try {
            const response = await axios.post(`/order/claim/${claimCode}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async deleteOrder(id) {
        try {
            const response = await axios.delete(`/order/${id}`);
            return response.status === 204;
        } catch (err) {
            throw err;
        }
    }
}

export default OrderService;
