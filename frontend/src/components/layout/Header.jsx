import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiBell,
  FiCalendar,
  FiChevronDown,
  FiLogOut,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useLogoutAdminMutation } from "../../features/auth/authApiSlice";

const tabs = [
  { to: "/dashboard", label: "Analytics" },
  { to: "/income", label: "Reports" },
  { to: "/profile", label: "Settings" },
];

const getTitle = (pathname) => {
  if (pathname.startsWith("/students/") && pathname.endsWith("/edit")) return "Edit Student";
  if (pathname.startsWith("/students/")) return "Students";
  if (pathname.startsWith("/students")) return "Students";
  if (pathname.startsWith("/income")) return "Income";
  if (pathname.startsWith("/expenses")) return "Expenses";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Dashboard";
};

const Header = () => {
  const { adminInfo } = useSelector((state) => state.auth);
  const [logoutAdmin, { isLoading }] = useLogoutAdminMutation();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logoutAdmin();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        {pathname.startsWith("/students/") && !pathname.endsWith("/edit") ? (
          <div className="topbar-search" aria-label="Search">
            <FiSearch aria-hidden="true" />
            <span>Search records...</span>
          </div>
        ) : (
          <h1>{getTitle(pathname)}</h1>
        )}
        <nav className="topbar-tabs" aria-label="Workspace tabs">
          {tabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to}>
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="topbar-actions">
        {pathname.startsWith("/dashboard") ? (
          <button className="topbar-period" type="button">
            <FiCalendar aria-hidden="true" />
            <span>Last 30 Days</span>
            <FiChevronDown aria-hidden="true" />
          </button>
        ) : null}
        <button className="icon-button" type="button" aria-label="Notifications">
          <FiBell aria-hidden="true" />
        </button>
        <div className="admin-chip">
          {adminInfo?.profilePicture ? (
            <img src={adminInfo.profilePicture} alt="" />
          ) : (
            <FiUser aria-hidden="true" />
          )}
          <span>{adminInfo?.name || "Admin"}</span>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          className="icon-button logout-button"
          onClick={handleLogout}
          disabled={isLoading}
          aria-label={isLoading ? "Signing out" : "Logout"}
        >
          <FiLogOut aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
