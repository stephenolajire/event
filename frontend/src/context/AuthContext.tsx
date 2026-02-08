import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

// Types
interface DecodedToken {
  exp: number;
  iat?: number;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Decode the token
      const decoded = jwtDecode<DecodedToken>(token);

      // Check if token is expired
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token expired
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        return;
      }

      // Token is valid
      setIsAuthenticated(true);
    } catch (error) {
      // Invalid token
      console.error("Token validation failed:", error);
      localStorage.removeItem("authToken");
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
