import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/",             label: "Dashboard" },
  { to: "/cases",        label: "Cases" },
  { to: "/hearings",     label: "Hearings" },
  { to: "/risk-analyzer", label: "Risk Analyzer" },
  { to: "/drafter",       label: "Document Drafter" },
  { to: "/translator",    label: "Translator" },
  { to: "/documents",    label: "Document Analyzer" },
  { to: "/legal-chat",   label: "AI Legal Assistant" },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="w-56 bg-blue-950 min-h-screen p-5 shrink-0">
      <h2 className="text-white text-sm font-semibold mb-6 uppercase tracking-widest">
        Menu
      </h2>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                location.pathname === link.to
                  ? "bg-blue-700 text-white font-medium"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;