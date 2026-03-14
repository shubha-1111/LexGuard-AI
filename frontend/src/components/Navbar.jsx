import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">LexGuard AI</h1>
      <button
        onClick={handleLogout}
        className="bg-blue-700 hover:bg-blue-600 px-4 py-1 rounded transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;