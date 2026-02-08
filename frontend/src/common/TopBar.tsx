import { Search, Bell, Settings, User, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useUser";

interface TopBarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const TopBar = ({ collapsed, toggleMobileSidebar }: TopBarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { logout } = useLogout();

  const notifications = [
    {
      id: 1,
      title: "New guest registered",
      message: "John Smith registered for Tech Conference 2024",
      time: "5 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Event reminder",
      message: "Annual Gala starts in 2 hours",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Check-in completed",
      message: "150 guests checked in successfully",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={`fixed top-0 right-0 h-16 sm:h-20 bg-dark-light border-b border-primary-900 z-30 transition-all duration-300 left-0 ${
        collapsed ? "lg:left-20" : "lg:left-64"
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 hover:bg-primary-900 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-primary-400" />
          </button>

          {/* Search Bar */}
          <div className="relative hidden sm:block flex-1 max-w-md lg:max-w-lg">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
            />
            <input
              type="text"
              placeholder="Search events, guests..."
              className="pl-10 pr-4 py-2 w-full bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon */}
          <button className="sm:hidden p-2 hover:bg-primary-900 rounded-lg transition-colors">
            <Search size={20} className="text-primary-400" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 hover:bg-primary-900 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-primary-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden max-h-[80vh]">
                <div className="p-4 border-b border-primary-900 flex items-center justify-between sticky top-0 bg-dark z-10">
                  <h3 className="font-semibold text-light text-sm sm:text-base">
                    Notifications
                  </h3>
                  <span className="text-xs text-primary-400">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-primary-900 hover:bg-primary-900/30 transition-colors cursor-pointer ${
                        notification.unread ? "bg-primary-900/20" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 shrink-0"></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-light mb-1 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-primary-300 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-primary-500">
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-primary-900">
                  <button className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="hidden sm:block p-2 hover:bg-primary-900 rounded-lg transition-colors">
            <Settings size={20} className="text-primary-400" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 sm:gap-3 p-2 hover:bg-primary-900 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
                <User size={16} className="text-light" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-light">John Doe</p>
                <p className="text-xs text-primary-400">Admin</p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-primary-900">
                  <p className="text-sm font-semibold text-light">John Doe</p>
                  <p className="text-xs text-primary-400 truncate">
                    john@example.com
                  </p>
                </div>
                <div className="py-2">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-primary-300 hover:bg-primary-900/30 hover:text-light transition-colors"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-primary-300 hover:bg-primary-900/30 hover:text-light transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-primary-900">
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
