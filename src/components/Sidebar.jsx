// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Droplets, Settings } from "lucide-react";
import "./Sidebar.css";

const navItems = [
  { to: "/",          label: "Dashboard",  icon: <LayoutDashboard size={18} /> },
  { to: "/boutbira/1",label: "Boutbira 1", icon: <Droplets size={18} /> },
  { to: "/boutbira/2",label: "Boutbira 2", icon: <Droplets size={18} /> },
  { to: "/boutbira/3",label: "Boutbira 3", icon: <Droplets size={18} /> },
  { to: "/admin",     label: "Admin",      icon: <Settings size={18} /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>💧 BridgeFlow</span>
      </div>
      <nav>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}                     // exact match for root
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}