import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "./toastStyle.css";

import { AuthProvider } from "./context/AuthContext";
import HomeLayout from "./layout/HomeLayout";
import Landing from "./pages/Landing";
import Login from "./user/Login";
import Signup from "./user/SignUp";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Events from "./admin/Events";
import Guests from "./admin/Guests";
import CheckIn from "./admin/Checkins";
import ProtectedRoute from "./constant/ProtectedRoute";
import Invitations from "./admin/Invitations";
import Settings from "./admin/Settings";
import Profile from "./admin/Profile";
import CreateEvent from "./admin/CreateEvent";
import AddGuest from "./admin/AddGuest";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomeLayout />}>
              <Route index element={<Landing />} />
            </Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route
                path="events/:id"
                element={<div>Event Details Page</div>}
              />
              <Route path="create-event" element={<CreateEvent />} />
              <Route path="guests" element={<Guests />} />
              <Route path="add-guest" element={<AddGuest />} />
              <Route path="qr-codes" element={<div>QR Codes Page</div>} />
              <Route path="check-in" element={<CheckIn />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="analytics" element={<div>Analytics Page</div>} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="help" element={<div>Help & Support Page</div>} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Router>
      </AuthProvider>

      {/* React Query Devtools - Only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
