import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner-ring" />
      <p className="spinner-text">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
