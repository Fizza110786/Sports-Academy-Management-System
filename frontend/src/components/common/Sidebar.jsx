import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBook,
  FiCalendar,
  FiClipboard,
  FiDollarSign,
  FiBell,
  FiTrendingUp,
  FiLogOut,
  FiSettings,
  FiCreditCard,
  FiUser
} from "react-icons/fi";
import { FaMoon, FaSun } from "react-icons/fa"; // ✅ import FaSun
import { useTheme } from "../../context/ThemeContext";
import "./Sidebar.css";

export default function Sidebar({ role: propRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme(); // ✅ destructure theme too

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const role = propRole || storedUser?.role;

  if (!role) return null;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuConfig = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
      { label: "Users", path: "/admin/users", icon: FiUsers },
      { label: "Programs", path: "/admin/programs", icon: FiBook },
      { label: "Batches", path: "/admin/batches", icon: FiCalendar },
      { label: "Schedule", path: "/admin/schedules", icon: FiCalendar },
      { label: "Attendance", path: "/admin/attendance", icon: FiClipboard },
      { label: "Fees", path: "/admin/fees", icon: FiCreditCard },
      { label: "Payments", path: "/admin/payments", icon: FiDollarSign },
      { label: "Announcements", path: "/admin/announcements", icon: FiBell },
      { label: "Reports", path: "/admin/reports", icon: FiTrendingUp },
      { label: "Settings", path: "/admin/settings", icon: FiSettings }
    ],
    coach: [
      { label: "Dashboard", path: "/coach/dashboard", icon: FiHome },
      { label: "My Batches", path: "/coach/batches", icon: FiUsers },
      { label: "Attendance", path: "/coach/attendance", icon: FiClipboard },
      { label: "Schedule", path: "/coach/schedule", icon: FiCalendar },
      { label: "Performance", path: "/coach/performance", icon: FiTrendingUp },
      { label: "Materials", path: "/coach/materials", icon: FiBook },
      { label: "Announcements", path: "/coach/announcements", icon: FiBell },
      { label: "Profile", path: "/coach/profile", icon: FiUser }
    ],
    student: [
      { label: "Dashboard", path: "/student/dashboard", icon: FiHome },
      { label: "My Attendance", path: "/student/attendance", icon: FiClipboard },
      { label: "Schedule", path: "/student/schedule", icon: FiCalendar },
      { label: "Pay Fees", path: "/student/pay-fees", icon: FiDollarSign },
      { label: "Payment History", path: "/student/payments", icon: FiDollarSign },
      { label: "Materials", path: "/student/materials", icon: FiBook },
      { label: "Announcements", path: "/student/announcements", icon: FiBell },
      { label: "My Progress", path: "/student/progress", icon: FiTrendingUp },
      { label: "Profile", path: "/student/profile", icon: FiUser }
    ]
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">🏆</div>
        <div>
          <h3>Sports</h3>
          <p>Academy Manager</p>
        </div>
      </div>

      <div className="current-role">
        <span>CURRENT ROLE</span>
        <div className="role-row">
          <div className="role-badge">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
          {/* ✅ swap icon based on current theme */}
          {theme === "dark"
            ? <FaSun className="theme-icon" onClick={toggleTheme} />
            : <FaMoon className="theme-icon" onClick={toggleTheme} />
          }
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuConfig[role]?.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={isActive ? "active" : ""}
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}