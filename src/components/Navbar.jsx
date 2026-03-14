import React from "react";

const Navbar = () => {
  return (
    <div className="bg-blue-900 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">LexGuard AI</h1>
      <div>
        <button className="bg-blue-600 px-4 py-1 rounded">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;