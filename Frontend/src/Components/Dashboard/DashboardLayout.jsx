
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import '../styles/DashboardLayout.css';

export default function DashboardLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        {/* Topbar */}
        <nav className="dashboard-topbar">
          <div className="topbar-content">
            <h2>Account Overview</h2>
          </div>
        </nav>

        {/* Main content */}
        <main className="dashboard-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
