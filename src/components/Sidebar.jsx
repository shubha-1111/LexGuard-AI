import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 h-screen p-5">

      <h2 className="text-xl font-bold mb-6">
        Menu
      </h2>

      <ul className="space-y-4">

        <li>
          <Link to="/">Dashboard</Link>
        </li>

        <li>
          <Link to="/cases">Cases</Link>
        </li>

        <li>
          <Link to="/documents">Document Analyzer</Link>
        </li>

      </ul>
    </div>
  );
};

export default Sidebar;