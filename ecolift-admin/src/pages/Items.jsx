import React, { useEffect, useState } from "react";
import ItemService from "../services/ItemService";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import "./Item.css";

const ItemsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);

    // Fetch all items from API
    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await ItemService.getItems();
            setItems(data);
        } catch (err) {
            toast.error("Failed to fetch items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Formik form for Create/Update
    const formik = useFormik({
        initialValues: {
            name: "",
            price: "",
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .max(100, "Name too long")
                .required("Name is required"),
            price: Yup.number()
                .typeError("Price must be a number")
                .min(0, "Price can't be negative")
                .required("Price is required"),
        }),
        onSubmit: async (values) => {
            try {
                if (editingItemId) {
                    // Update
                    await ItemService.updateItem(editingItemId, {
                        name: values.name,
                        price: Number(values.price),
                    });
                    toast.success("Item updated successfully");
                } else {
                    // Create
                    await ItemService.createItem({
                        name: values.name,
                        price: Number(values.price),
                    });
                    toast.success("Item created successfully");
                }
                fetchItems();
                closeModal();
            } catch (err) {
                toast.error("Failed to save item");
            }
        },
    });

    // Open modal for create or edit
    const openModal = (item = null) => {
        if (item) {
            setEditingItemId(item._id || item.id); // support both
            formik.setValues({
                name: item.name,
                price: item.price.toString(),
            });
        } else {
            setEditingItemId(null);
            formik.resetForm();
        }
        setShowModal(true);
    };

    // Close modal and reset form
    const closeModal = () => {
        setShowModal(false);
        formik.resetForm();
        setEditingItemId(null);
    };

    // Delete an item
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            await ItemService.deleteItem(id);
            toast.success("Item deleted successfully");
            fetchItems();
        } catch (err) {
            toast.error("Failed to delete item");
        }
    };

    return (
        <>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>Item Management</h2>
                    <button className="create-button" onClick={() => openModal()}>
                        + Add New Item
                    </button>
                </div>


                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading items...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <p>No items found. Add your first item!</p>
                    </div>
                ) : (
                    <table className="items-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price ($)</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((item) => (
                            <tr key={item._id || item.id}>
                                <td>{item.name}</td>
                                <td>{item.price.toFixed(2)}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() => openModal(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(item._id || item.id)}
                                    >
                                        Delete
                                    </button>
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
                        <h3>{editingItemId ? "Edit Item" : "Add New Item"}</h3>

                        <form onSubmit={formik.handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.name}
                                    className={formik.touched.name && formik.errors.name ? "input-error" : ""}
                                />
                                {formik.touched.name && formik.errors.name ? (
                                    <div className="error">{formik.errors.name}</div>
                                ) : null}
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Price ($)</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.price}
                                    className={formik.touched.price && formik.errors.price ? "input-error" : ""}
                                />
                                {formik.touched.price && formik.errors.price ? (
                                    <div className="error">{formik.errors.price}</div>
                                ) : null}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <button type="button" onClick={closeModal} className="close-button">
                                    Cancel
                                </button>
                                <button type="submit" className="close-button" style={{backgroundColor: "#009688", color: "white"}}>
                                    {editingItemId ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ItemsPage;
