
import { Routes, Route, Navigate } from "react-router-dom";

/* Landing page */
import Landing from "./Components/Landing";

/* Auth pages */
import Login from "./Components/Login";
import Register from "./Components/Register";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";

/* Dashboard layout and pages */
import DashboardLayout from "./Components/Dashboard/DashboardLayout";
import Overview from "./Components/Pages/Overview";
import Accounts from "./Components/Pages/Accounts";
import Transfers from "./Components/Pages/Transfers";
import Transactions from "./Components/Pages/Transactions";
import Profile from "./Components/Pages/Profile";

/* Protected Route wrapper */
import ProtectedRoute from "./Components/Auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<h1>404: Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
