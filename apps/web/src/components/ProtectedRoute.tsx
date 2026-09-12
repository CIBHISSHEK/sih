import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "../context/AuthContext";

export function ProtectedRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { token, role } = useAuth();
  if (!token || !role) return <Navigate to="/" replace />;
  if (!roles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
