import React from 'react';

function LoadingScreen({ message = "Loading..." }) {
  return <div className="loading-screen">{message}</div>;
}

export default LoadingScreen;
