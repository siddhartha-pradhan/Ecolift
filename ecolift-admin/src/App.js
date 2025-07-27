import "./App.css";
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Routing from "./utils/routing";
import createStore from "react-auth-kit/createStore";
import AuthProvider from "react-auth-kit";
import {ToastContainer } from 'react-toastify';

function App() {
  const store = createStore({
    authName: "_auth",
    authType: "cookie",
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === "https:",
  });

  return (
    <AuthProvider store={store}>
      <Router>
        <Routing />
      </Router>
      <ToastContainer position={"bottom-right"} closeButton={false}/>
    </AuthProvider>
  );
}

export default App;
