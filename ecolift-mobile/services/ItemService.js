import api from "./Api";

class ItemService {
    static async getItems() {
        try {
            const response = await api.get("/item");
            return response.data;
        } catch (err) {
            throw err; // Caller handles it
        }
    }

    static async reduceRedeemPoints(userId, amount) {
        try {
            const response = await api.post("/item/redeem", {
                userId,
                amount
            });
            return response.data;
        } catch (err) {
            throw err; // Caller handles it
        }
    }
}

export default ItemService;
