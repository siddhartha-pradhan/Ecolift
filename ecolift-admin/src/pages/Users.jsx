import React, { useEffect, useState } from "react";
import { FaEllipsisV, FaFilter, FaSearch } from "react-icons/fa";
import UserService from "../services/UserService";
import "./Dashboard.css";
import "./Users.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [premiumUserCount, setPremiumUserCount] = useState(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      id:"",
      subscription: "",
    },
    validationSchema: Yup.object({
      subscription: Yup.string().required("Please choose subscription."),
    }),
    onSubmit: async (values) => {},
  });

  const fetchUsers = async () => {
    setLoading(true);
    // Mock user data - replace with API call in production
    const users = await UserService.getUsers();

    setTimeout(() => {
      setUsers(users);
      setFilteredUsers(users);
      setActiveUserCount(users.filter((user) => user.isActive).length);
      setUserCount(users.length);
      setPremiumUserCount(users.filter((user) => user?.isPremium).length);
      setLoading(false);
    }, 800); // Simulate API delay
  };

  useEffect(() => {
    // Simulate fetching user data

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term and filter status
    const result = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "premium" && !user.userProfile.premium) ||
        (filterStatus === "non-premium" && user.userProfile.premium) ||
        user.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    setFilteredUsers(result);
  }, [searchTerm, filterStatus, users]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setIsFilterMenuOpen(false);
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "true":
        return "status-active";
      case "false":
        return "status-inactive";
      case "suspended":
        return "status-suspended";
      default:
        return "";
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleUserUpdate = async () => {
    try {
      var user = {
        id:formik.values.id,
        isPremium: formik.values.subscription === "Premium" ? true :false
      }
      await UserService.updateUser(formik.values.id, user);
      await fetchUsers();
      closeModal()
      toast.success("Successfully updated users data");
    } catch (err) {
      toast.error("Error updating rider data");
    }
  };

  return (
    <>
      <div className="users-container">
        <div className="users-header">
          <h2>User Management</h2>
          <div className="users-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="filter-container">
              <button className="filter-button" onClick={toggleFilterMenu}>
                <FaFilter className="filter-icon" />
                <span>Filter</span>
              </button>
              {isFilterMenuOpen && (
                <div className="filter-menu">
                  <button
                    className={filterStatus === "all" ? "active" : ""}
                    onClick={() => handleFilterChange("all")}
                  >
                    All Users
                  </button>
                  <button
                    className={filterStatus === "premium" ? "active" : ""}
                    onClick={() => handleFilterChange("premium")}
                  >
                    Premium
                  </button>
                  <button
                    className={filterStatus === "non-premium" ? "active" : ""}
                    onClick={() => handleFilterChange("non-premium")}
                  >
                    Non-Premium
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="users-stats">
          <div className="user-stat-box">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
          <div className="user-stat-box">
            <h3>Premium Users</h3>
            <p>{users.filter(x => x.userProfile.isPremium).length}</p>
          </div>
          <div className="user-stat-box">
            <h3>Non-Premium Users</h3>
            <p>{users.filter(x => !x.userProfile.isPremium).length}</p>
          </div>
        </div>

        <div className="users-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Join Date</th>
                  <th>Premium</th>
                  <th>Trips</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-info">
                      <div className="user-avatar">{user.name.charAt(0)}</div>
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user?.location?.type ?? "None"}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span
                        className={`premium-badge ${
                          user.userProfile.isPremium
                            ? "is-premium"
                            : "not-premium"
                        }`}
                      >
                        {user.userProfile.isPremium ? "Premium" : "Standard"}
                      </span>
                    </td>
                    <td>{user.trips}</td>
                    <td>
                      <div className="user-actions">
                        <button
                          className="action-btn edit-btn"
                          type="button"
                          onClick={() => {
                            formik.setFieldValue("id", user._id);
                            formik.setFieldValue(
                              "subscription",
                              user.userProfile?.isPremium ? "Premium":"Standard"
                            );
                            openModal();
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <div
          className="modal-overlay"
          onClick={handleModalOverlayClick}
          style={{ paddingTop: "100px", paddingBottom: "100px" }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: "450px", margin: "0 auto"}}>
            <button className="modal-close-btn" onClick={closeModal}>
              ×
            </button>

            <h2 className="role-title teal-header">User Information</h2>

              <div className="user-form">
                <div className="form-group">
                  <label htmlFor="subscription">Subscription</label>

                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <select
                        id="subscription"
                        name="subscription"
                        className="form-control"
                        value={formik.values.subscription}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        style={{ width: "60%" }} // optional: controls width of the dropdown
                    >
                      <option value="">-- Select --</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  {formik.touched.subscription && formik.errors.subscription && (
                      <div className="error">{formik.errors.subscription}</div>
                  )}
                </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="close-button" onClick={closeModal}>
                Close
              </button>
              <button
                  type="button"
                  className="logout-button"
                  onClick={() => handleUserUpdate()}
              >
                <span className="logout-icon"></span>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
