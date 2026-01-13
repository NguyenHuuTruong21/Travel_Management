// layout chung login/register

import React from 'react';

const AuthWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded">
        {children}
      </div>
    </div>
  );
};

export default AuthWrapper;
