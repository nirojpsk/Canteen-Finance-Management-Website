import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  FiBell,
  FiCalendar,
  FiMonitor,
  FiMoon,
  FiLogOut,
  FiSearch,
  FiSun,
  FiUser,
} from "react-icons/fi";
import { useLogoutAdminMutation } from "../../features/auth/authApiSlice";

const THEME_STORAGE_KEY = "canteen-theme";

const resolveTheme = (theme) => {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

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
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "system";
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme || "system";
  });

  const themeOptions = useMemo(
    () => [
      { value: "light", label: "Light", icon: FiSun },
      { value: "dark", label: "Dark", icon: FiMoon },
      { value: "system", label: "System", icon: FiMonitor },
    ],
    [],
  );

  const today = new Date().toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    const appliedTheme = resolveTheme(theme);
    document.documentElement.setAttribute("data-theme", appliedTheme === "dark" ? "dark" : "light");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handlePreferenceChange = () => {
      if (theme === "system") {
        const appliedTheme = resolveTheme("system");
        document.documentElement.setAttribute("data-theme", appliedTheme === "dark" ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handlePreferenceChange);
    return () => mediaQuery.removeEventListener("change", handlePreferenceChange);
  }, [theme]);

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
      </div>
      <div className="topbar-actions">
        <div className="topbar-period" aria-label="Current date">
          <FiCalendar aria-hidden="true" />
          <span>{today}</span>
        </div>
        <div className="theme-switcher" role="group" aria-label="Theme switcher">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`theme-chip ${isActive ? "active" : ""}`}
                onClick={() => setTheme(option.value)}
                aria-pressed={isActive}
                title={`${option.label} theme`}
              >
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </div>
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
