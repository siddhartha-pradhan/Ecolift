import axios from "../utils/axios/axios";

class ItemService {
    static async getItems() {
        try {
            const response = await axios.get("/item");
            return response.data;
        } catch (err) {
            throw err; // Caller handles it
        }
    }

    static async getItem(id) {
        try {
            const response = await axios.get(`/item/${id}`);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async createItem(data) {
        try {
            const response = await axios.post("/item", data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async updateItem(id, data) {
        try {
            const response = await axios.put(`/item/${id}`, data);
            return response.data;
        } catch (err) {
            throw err;
        }
    }

    static async deleteItem(id) {
        try {
            const response = await axios.delete(`/item/${id}`);
            return response.status === 204; // true if deleted
        } catch (err) {
            throw err;
        }
    }
}

export default ItemService;
