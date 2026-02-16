import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./constant/ProtectedRoute";
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
import Invitations from "./admin/Invitations";
import Settings from "./admin/Settings";
import Profile from "./admin/Profile";
import CreateEvent from "./admin/CreateEvent";
import AddGuest from "./admin/AddGuest";
import ValidateQR from "./pages/ValidateQR";
import TicketDashboard from "./ticket/TicketDashboard";
import TicketLayout from "./layout/TicketLayout";
import CreateTicketType from "./ticket/CreateTicket";
import TicketsList from "./ticket/TicketList";
import OrdersList from "./ticket/OrderList";
import OrderDetails from "./ticket/OrderDetails";
import EditTicketType from "./ticket/EditTicket";
import EventTicketPage from "./user-event/EventPage";
import EventLayout from "./layout/EventLayout";
import TicketCheckout from "./user-event/TicketCheckout";
import PaymentSuccess from "./user-event/PaymentSuccess";
import MyTickets from "./user-event/MyTicket";
// import CustomerDashoard from "./user-event/CustomerDashboard"
import CustomerDashboard from "./user-event/CustomerDashboard";
import BrowseEvents from "./user-event/BrowseEvent";

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
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeLayout />}>
              <Route index element={<Landing />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Public Event Page (No Auth Required) */}
            <Route path="/events/:slug/tickets" element={<EventTicketPage />} />
            <Route path="/validate-qr/:token" element={<ValidateQR />} />

            {/* Organizer-Only Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireOrganizer>
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

            {/* Organizer Ticket Management Routes */}
            <Route
              path="/ticket"
              element={
                <ProtectedRoute requireOrganizer>
                  <TicketLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TicketDashboard />} />
              <Route path="create" element={<CreateTicketType />} />
              <Route path="tickets" element={<TicketsList />} />
              <Route path="edit/:id" element={<EditTicketType />} />
              <Route path="orders" element={<OrdersList />} />
              <Route path="orders/:id" element={<OrderDetails />} />
            </Route>

            {/* Customer-Only Routes (Authenticated) */}
            <Route
              path="/event"
              element={
                <ProtectedRoute>
                  <EventLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="checkout" element={<TicketCheckout />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="tickets" element={<MyTickets />} />
              <Route path="browse-events" element={<BrowseEvents />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Shared Authenticated Routes (Both user types) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </Router>

      {/* React Query Devtools - Only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
