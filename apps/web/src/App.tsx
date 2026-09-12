import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerHome from "./pages/farmer/FarmerHome";
import BookingWizard from "./pages/farmer/BookingWizard";
import BookingTracker from "./pages/farmer/BookingTracker";
import VoiceBooking from "./pages/farmer/VoiceBooking";
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/register"
        element={
          <ProtectedRoute roles={["FARMER"]}>
            <Register />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer"
        element={
          <ProtectedRoute roles={["FARMER"]}>
            <FarmerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/book"
        element={
          <ProtectedRoute roles={["FARMER"]}>
            <BookingWizard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/voice"
        element={
          <ProtectedRoute roles={["FARMER"]}>
            <VoiceBooking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/booking/:id"
        element={
          <ProtectedRoute roles={["FARMER"]}>
            <BookingTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={["STAFF", "ADMIN"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
