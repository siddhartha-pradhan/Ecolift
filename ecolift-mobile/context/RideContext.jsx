//@ts-check
import React, { createContext, useState, useContext } from "react";

const RideContext = createContext({
  rideData: null,
  updateRideData: (data) => {},

  clearRideData: () => {},

  userData: null,
  updateUserData: (data) => {},
  clearUserData: () => {},

  rideRequestData: null,
  updateRideRequestedData: (data) => {},

  rideOngoingDataRider: null,
  updateRideOngoingDataRider: (data) => {},

  rideOngoingDataUser: null,
  updateRideOngoingDataUser: (data) => {},
});

export const RideProvider = ({ children }) => {
  const [rideData, setRideData] = useState(null);
  const [rideOngoingDataUser, setRideOngoingDataUser] = useState(null);
  const [rideOngoingDataRider, setRideOngoingDataRider] = useState(null);

  const [rideRequestData, setRideRequestData] = useState(null);
  const [userData, setUserData] = useState(null);

  const updateRideData = (data) => setRideData(data);
  const clearRideData = () => setRideData(null);

  const updateUserData = (data) => setUserData(data);
  const clearUserData = () => setUserData(null);
  const updateRideRequestedData = (data) => setRideRequestData(data);
  const clearRideRequestData = () => setRideRequestData(null);

  const updateRideOngoingDataUser = (data) => setRideOngoingDataUser(data);
  const clearRideOngoingDataUser = () => setRideOngoingDataUser(null);
  const updateRideOngoingDataRider = (data) => setRideOngoingDataRider(data);
  const clearRideOngoingDataRider = () => setRideOngoingDataRider(null);

  return (
    <RideContext.Provider
      value={{
        rideData,
        updateRideData,
        clearRideData,
        userData,
        updateUserData,
        clearUserData,
        rideRequestData,
        updateRideRequestedData,
        rideOngoingDataRider,
        updateRideOngoingDataRider,
        rideOngoingDataUser,
        updateRideOngoingDataUser
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
