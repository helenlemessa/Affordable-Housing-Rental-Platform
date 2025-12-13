import React from "react";

const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div
      className={`${
        fullScreen ? "h-screen" : "h-32"
      } flex items-center justify-center`}
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
