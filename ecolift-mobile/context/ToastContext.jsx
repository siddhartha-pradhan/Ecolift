// ToastContext.js
import React, { createContext, useContext } from 'react';
import Toast from 'react-native-toast-message';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showSuccessToast = (message) => {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const showErrorToast = (message) => {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const showInfoToast = (message) => {
    Toast.show({
      type: 'info',
      text1: 'Information',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };


  return (
    <ToastContext.Provider value={{ showSuccessToast, showErrorToast, showInfoToast }}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
