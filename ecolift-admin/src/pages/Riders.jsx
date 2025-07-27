import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { FaEllipsisV, FaFilter, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import * as Yup from "yup";
import DriverService from "../services/DriverService";
import "./Dashboard.css";
import "./Home.css";
import "./Riders.css";

const Riders = () => {
  const [riders, setRiders] = useState([]);
  const [filteredRiders, setFilteredRiders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [riderCount, setRiderCount] = useState(0);
  const [activeRiderCount, setActiveRiderCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [editUser, setEditUser] = useState(undefined);
  const [bluebookImage, setBluebookImage] = useState();
  const [licenseImage, setLicenseImage] = useState();
  const fetchRiders = async () => {
    setLoading(true);
    // Mock user data - replace with API call in production
    const users = await DriverService.getDrivers();

    setTimeout(() => {
      setRiders(users);
      setFilteredRiders(users);
      setActiveRiderCount(users.filter((user) => user.isActive).length);
      setRiderCount(users.length);
      setLoading(false);
    }, 800); // Simulate API delay
  };

  const formik = useFormik({
    initialValues: {
      id: "",
      name: editUser?.name || "",
      email: editUser?.email || "",
      phonenumber: editUser?.phone || "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(6, "Must be at least 6 characters")
        .required("Required"),
      phone: Yup.string()
        .matches(/^\+?[0-9]{7,14}$/, "Invalid phone number")
        .required("Required"),
      vehicleImage: Yup.mixed().required("Vehicle image is required"),
      vehicleLicense: Yup.string().required("Vehicle license is required"),
    }),
    onSubmit: async (values) => {},
  });

  useEffect(() => {
    // Simulate fetching user data

    fetchRiders();
  }, []);

  useEffect(() => {
    // Filter users based on search term and filter status
    const result = riders?.filter((rider) => {
      const matchesSearch =
        rider?.user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        rider?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider?.user?.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || rider?.adminVerification.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    setFilteredRiders(result);
  }, [searchTerm, filterStatus, riders]);

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
      case "Approved":
        return "status-active";
      case "Reject":
        return "status-inactive";
      case "Suspended":
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

  const handleRiderUpdate = async () => {
    try {
      await DriverService.updatedRider(formik.values);
      await fetchRiders();
      toast.success("Successfully updated rider data");
    } catch (err) {
      toast.error("Error updating rider data");
    }
  };

  const handleFileChange = (event) => {
    formik.setFieldValue("vehicleImage", event.currentTarget.files[0]);
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
                    className={filterStatus === "Approved" ? "active" : ""}
                    onClick={() => handleFilterChange("Approved")}
                  >
                    Approved
                  </button>
                  <button
                    className={filterStatus === "Pending" ? "active" : ""}
                    onClick={() => handleFilterChange("Pending")}
                  >
                    Pending
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="users-stats">
          <div className="user-stat-box">
            <h3>Total Riders</h3>
            <p>{riderCount}</p>
          </div>

          <div className="user-stat-box">
            <h3>Active Riders</h3>
            <p>{activeRiderCount}</p>
          </div>
        </div>

        <div className="users-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredRiders && filteredRiders.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Trips</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map((user) => (
                  <tr key={user.id}>
                    <td className="user-info">
                      <div className="user-avatar">
                        {user?.user?.name?.charAt(0)}
                      </div>
                      <span>{user?.user?.name}</span>
                    </td>
                    <td>{user?.user?.email}</td>
                    <td>{user?.location}</td>
                    <td>{formatDate(user?.user?.createdAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          user?.adminVerification?.status?.toString()
                        )}`}
                      >
                        {user?.adminVerification?.status?.toString() ??
                          "Pending"}
                      </span>
                    </td>
                    <td>{user?.user?.trips}</td>
                    <td>
                      <div className="user-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => {
                            setShowModal(true);
                            formik.setValues({
                              name: user.user.name,
                              email: user.user.email,
                              phonenumber: user.user.phonenumber,
                              id: user.user._id,
                            });
                            setBluebookImage(user.bluebookImage);
                            setLicenseImage(user.licenseImage);
                          }}
                        >
                          View
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal}>
              ×
            </button>

            <h2 className="role-title teal-header">User Information</h2>

            <div className="role-info" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* Left: User Info Form */}
              <div className="user-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                      type="text"
                      name="name"
                      onChange={(e) => formik.setFieldValue("name", e.target.value)}
                      value={formik.values.name}
                  />
                  {formik.touched.name && formik.errors.name && (
                      <div className="error">{formik.errors.name}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                      type="email"
                      name="email"
                      onChange={(e) => formik.setFieldValue("email", e.target.value)}
                      value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                      <div className="error">{formik.errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number:</label>
                  <input
                      type="tel"
                      name="phonenumber"
                      onChange={(e) => formik.setFieldValue("phonenumber", e.target.value)}
                      value={formik.values.phonenumber}
                  />
                  {formik.touched.phonenumber && formik.errors.phonenumber && (
                      <div className="error">{formik.errors.phonenumber}</div>
                  )}
                </div>
              </div>

              {/* Right: Images */}
              <div className="user-images">
                <div className="form-group">
                  <label>Bluebook:</label>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img
                        src={`http://127.0.0.1:3001/${bluebookImage}`}
                        alt="Bluebook"
                        height={120}
                        width={150}
                        style={{ borderRadius: "8px" }}
                    />
                  </div>
                  {formik.touched.vehicleImage && formik.errors.vehicleImage && (
                      <div className="error">{formik.errors.vehicleImage}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>License Image:</label>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img
                        src={`http://127.0.0.1:3001/${licenseImage}`}
                        alt="License"
                        height={120}
                        width={150}
                        style={{ borderRadius: "8px" }}
                    />
                  </div>
                  {formik.touched.licenseImage && formik.errors.licenseImage && (
                      <div className="error">{formik.errors.licenseImage}</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="close-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Riders;
