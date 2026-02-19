import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ CLEAR USER SESSION
    localStorage.removeItem("user");

    // ✅ REDIRECT TO LOGIN
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-light bg-light px-4 shadow-sm">
      <span className="navbar-brand">Dashboard</span>

      <button
        className="btn btn-outline-danger btn-sm"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  );
}
