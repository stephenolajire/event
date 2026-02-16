import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ScanLine,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  X,
} from "lucide-react";
import logo from "../../public/event.jpeg"

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const TicketSidebar = ({
  collapsed,
  setCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/ticket",
    },
    {
      id: "Tickets",
      label: "Tickets",
      icon: Calendar,
      path: "/ticket/tickets",
      //   badge: "12",
    },
    {
      id: "Orders",
      label: "Orders",
      icon: Users,
      path: "/ticket/orders",
    },
    // {
    //   id: "qr-codes",
    //   label: "QR Codes",
    //   icon: QrCode,
    //   path: "/dashboard/qr-codes",
    // },
    {
      id: "check-in",
      label: "Check-in",
      icon: ScanLine,
      path: "/dashboard/check-in",
    },
    {
      id: "Event",
      label: "Event",
      icon: Calendar,
      path: "/dashboard",
    },
    // {
    //   id: "analytics",
    //   label: "Analytics",
    //   icon: BarChart3,
    //   path: "/dashboard/analytics",
    // },
  ];

  const bottomMenuItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
    // {
    //   id: "help",
    //   label: "Help & Support",
    //   icon: HelpCircle,
    //   path: "/dashboard/help",
    // },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-dark border-r border-primary-900 transition-all duration-300 z-40 flex flex-col ${
        collapsed ? "w-20" : "w-64"
      } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-4 sm:px-6 border-b border-primary-900">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src={logo} className="w-10 h-10 rounded-full" />
          </Link>
        )}

        {/* Toggle Button - Desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden lg:block p-2 hover:bg-primary-900 rounded-lg transition-colors ${
            collapsed ? "mx-auto" : ""
          }`}
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-primary-400" />
          ) : (
            <ChevronLeft size={20} className="text-primary-400" />
          )}
        </button>

        {/* Close Button - Mobile */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-2 hover:bg-primary-900 rounded-lg transition-colors"
        >
          <X size={20} className="text-primary-400" />
        </button>
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-primary-900">
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 p-3 bg-primary-900/30 rounded-lg hover:bg-primary-900/50 transition-colors"
          >
            <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shrink-0">
              <User size={20} className="text-light" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-light truncate">
                John Doe
              </p>
              <p className="text-xs text-primary-400 truncate">
                john@example.com
              </p>
            </div>
            <Bell size={16} className="text-primary-400 shrink-0" />
          </Link>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  isActive(item.path)
                    ? "bg-primary-600 text-light shadow-lg"
                    : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                }`}
                title={collapsed ? item.label : ""}
              >
                <item.icon
                  size={20}
                  className={`shrink-0 ${
                    isActive(item.path)
                      ? "text-light"
                      : "text-primary-400 group-hover:text-light"
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left font-medium text-sm sm:text-base">
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-primary-900"></div>

        {/* Bottom Menu Items */}
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
                  isActive(item.path)
                    ? "bg-primary-600 text-light shadow-lg"
                    : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                }`}
                title={collapsed ? item.label : ""}
              >
                <item.icon
                  size={20}
                  className={`shrink-0 ${
                    isActive(item.path)
                      ? "text-light"
                      : "text-primary-400 group-hover:text-light"
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 text-left font-medium text-sm sm:text-base">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade Banner - Only show when not collapsed */}
      {!collapsed && (
        <div className="m-4 p-4 bg-linear-to-br from-primary-800 to-primary-900 rounded-xl border border-primary-700">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
              <BarChart3 size={16} className="text-light" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-light mb-1">
                Upgrade to Pro
              </h4>
              <p className="text-xs text-primary-300">
                Unlock unlimited events & advanced features
              </p>
            </div>
          </div>
          <button className="w-full bg-primary-600 hover:bg-primary-700 text-light text-sm font-semibold py-2 rounded-lg transition-colors">
            Upgrade Now
          </button>
        </div>
      )}
    </aside>
  );
};

export default TicketSidebar;
