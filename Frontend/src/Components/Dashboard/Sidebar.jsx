import { NavLink, useNavigate } from "react-router-dom";
import '../styles/Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">🏦</div>
          <h3>Siege Bank</h3>
        </div>
      </div>

      {/* User Info Section */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.username}</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              end
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Overview</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/accounts" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <span className="nav-icon">💳</span>
              <span className="nav-label">Accounts</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/transfers" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <span className="nav-icon">🔁</span>
              <span className="nav-label">Transfers</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/transactions" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <span className="nav-icon">📄</span>
              <span className="nav-label">Transactions</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/dashboard/profile" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
        <p className="sidebar-copy">&copy; {new Date().getFullYear()} Siege Bank</p>
      </div>
    </aside>
  );
}
