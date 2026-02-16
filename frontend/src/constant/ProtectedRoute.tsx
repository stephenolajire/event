// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUserType } from "../hooks/useUser";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrganizer?: boolean;
  requireCustomer?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOrganizer = false,
  requireCustomer = false,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isOrganizer, isCustomer, userType } = useUserType();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading || userType === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Pass current location so user can be redirected back after login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check organizer requirement
  if (requireOrganizer && !isOrganizer) {
    return <Navigate to="/events" replace />;
  }

  // Check customer requirement
  if (requireCustomer && !isCustomer) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
