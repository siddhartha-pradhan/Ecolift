import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import DriverService from "../services/DriverService";
import UserService from "../services/UserService";
import "./Dashboard.css";

const getPageTitle = (pathname) => {
  const page = pathname.split("/")[1] || "Dashboard";
  return page.charAt(0).toUpperCase() + page.slice(1);
};

const Dashboard = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPremiumUsers, setTotalPremiumUsers] = useState(0);
  const [pendingRiderApproval, setPendingRiderApproval] = useState(0);
  const [pendingRiders, setPendingRiders] = useState([]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [darkMode]);

  const fetchTotalUsers = async () => {
    try {
      const users = await UserService.getUsers();
      const premiumUsers = users.filter((user) => user.userProfile?.isPremium);
      setTotalUsers(users.length);
      setTotalPremiumUsers(premiumUsers.length);
    } catch (err) {
      toast.error("Error fetching user data");
    }
  };

    const fetchPendingRidersApproval = async () => {
    try {
      const pendingRiders = await DriverService.getPendingRiders();
      setPendingRiders(pendingRiders);
      setPendingRiderApproval(pendingRiders.length);
    } catch (err) {
      toast.error("Error fetching user data");
    }
  };

  useEffect(() => {
    // Simulating data fetching (replace with actual API calls)
    fetchTotalUsers();
    fetchPendingRidersApproval();
 
  }, []);

  const handleRiderAction = async (updatedRider, action) => {
    try{
      await DriverService.approveOrRejectDriver({...updatedRider, isVerified: action === "approve" });
      setPendingRiders((prevRiders) =>
      prevRiders.filter((rider) => rider.id !== updatedRider._id)
    );
      toast.success(`Rider ${action} successfully`);
    }catch(err){
      toast.error("Error updating rider status");
    }
    // Here you would normally call your API to update the rider's status

    // Update the UI by removing the rider from the list
 

    // Update the count of pending approvals
    setPendingRiderApproval((prevCount) => Math.max(0, prevCount - 1));
  };

  return (
    <>
      {/* Statistics Boxes */}
      <div className="stats-boxes">
        <div className="stats-box">
          <h3>Total Users</h3>
          {/* <p>{totalUsers}</p>  */}
          <p>{totalUsers}</p>
        </div>
        <div className="stats-box">
          <h3>Total Premium Users</h3>
          {/* <p>{totalPremiumUsers}</p> */}
          <p>{totalPremiumUsers}</p>
        </div>
        <div className="stats-box">
          <h3>Total Riders</h3>
          {/* <p>{totalUsers}</p>  */}
          <p>1</p>
        </div>
        <div className="stats-box">
          <h3>Pending Rider Approval</h3>
          {/* <p>{pendingRiderApproval}</p> */}
          <p>0</p>
        </div>
      </div>

      {/* Riders Approval Section */}
      <div className="riders-approval-section">
        <div className="riders-header">
          <h2>Pending Rider Approvals</h2>
          {/* <span className="riders-count">{pendingRiderApproval}</span> */}
          <span className="riders-count">0</span>
        </div>

        <div className="riders-list-container">
          {pendingRiders.length > 0 ? (
            <ul className="riders-list">
              {pendingRiders.map((rider) => (
                <li key={rider.id} className="rider-item">
                  <div className="rider-info">
                    <div className="rider-avatar">{rider?.user?.name?.charAt(0)}</div>
                    <div className="rider-details">
                      <h3>{rider?.User?.name}</h3>
                      <p>
                        {rider?.user?.email} • {rider?.user?.location?.coordinates?.[0]} • {rider?.user?.location?.coordinates?.[1]}
                      </p>
                    </div>
                  </div>
                  <div className="rider-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleRiderAction(rider, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleRiderAction(rider, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <h3>No pending approvals</h3>
              <p>All rider applications have been processed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Routed Page Content */}
      <Outlet />
    </>
  );
};

export default Dashboard;
