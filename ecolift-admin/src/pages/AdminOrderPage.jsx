import React, { useEffect, useState } from "react";
import OrderService from "../services/OrderService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "./Item.css";

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await OrderService.getAllOrders();
            setOrders(data);
        } catch (err) {
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const openModal = (order) => {
        setSelectedOrder(order);
        formik.setValues({ code: "" });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
        formik.resetForm();
    };

    const formik = useFormik({
        initialValues: {
            code: "",
        },
        validationSchema: Yup.object({
            code: Yup.string().required("Claim code is required"),
        }),
        onSubmit: async (values) => {
            try {
                await OrderService.claimOrderByCode(values.code);
                toast.success("Order claimed successfully");
                fetchOrders();
                closeModal();
            } catch (err) {
                toast.error("Please provide a valid claim code or token.");
            }
        },
    });

    return (
        <>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>All Orders (Admin View)</h2>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <p>No orders found.</p>
                    </div>
                ) : (
                    <table className="items-table">
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User</th>
                            <th>Total</th>
                            <th>Claim Code</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.userId?.name || "-"}</td>
                                <td>${order.totalAmount}</td>
                                <td>{order.claimCode}</td>
                                <td>{order.isClaimed ? "Claimed" : "Pending"}</td>
                                <td>
                                    {!order.isClaimed && (
                                        <button
                                            className="edit-button"
                                            onClick={() => openModal(order)}
                                        >
                                            Claim
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: 400, margin: "0 auto" }}
                    >
                        <button className="modal-close-btn" onClick={closeModal}>
                            ×
                        </button>
                        <h3>Claim Order</h3>

                        <form onSubmit={formik.handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="code">Claim Code</label>
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.code}
                                    className={formik.touched.code && formik.errors.code ? "input-error" : ""}
                                />
                                {formik.touched.code && formik.errors.code ? (
                                    <div className="error">{formik.errors.code}</div>
                                ) : null}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <button type="button" onClick={closeModal} className="close-button">
                                    Cancel
                                </button>
                                <button type="submit" className="close-button" style={{backgroundColor: "#009688", color: "white"}}>
                                    Verify & Claim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminOrdersPage;
