import { createElement } from "react";
import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiCreditCard,
  FiLayers,
  FiHome,
  FiPlus,
  FiTrendingDown,
  FiUsers,
  FiUser,
} from "react-icons/fi";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/students", label: "Students", icon: FiUsers },
  { to: "/income", label: "Income", icon: FiCreditCard },
  { to: "/expenses", label: "Expenses", icon: FiTrendingDown },
  { to: "/profile", label: "Profile", icon: FiUser },
];

const Sidebar = () => (
  <aside className="sidebar">
    <div className="brand">
      <span className="brand-mark">
        <FiBarChart2 aria-hidden="true" />
      </span>
      <span>
        <strong>Canteen Finance</strong>
        <small>Control Center</small>
      </span>
    </div>
    <div className="sidebar-label">Workspace</div>
    <nav className="sidebar-nav" aria-label="Main navigation">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} className="sidebar-link">
          {createElement(item.icon, { "aria-hidden": true })}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
    <NavLink to="/income" className="sidebar-transaction">
      <FiPlus aria-hidden="true" />
      <span>New Transaction</span>
    </NavLink>
    <div className="sidebar-footnote" aria-label="Environment status">
      <FiLayers aria-hidden="true" />
      <span>Live analytics connected</span>
    </div>
  </aside>
);

export default Sidebar;
