import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  QrCode,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";
import AOS from "aos";
import { Link } from "react-router-dom";
import {
  useDashboardStats,
  useExportGuestList,
  useEventStats,
} from "../hooks/useAnalytics";
import { useEvents } from "../hooks/useEvent";

const Dashboard = () => {
  const { data: stats, isLoading, isError, error } = useDashboardStats();
  const { data: eventsData } = useEvents();
  const exportMutation = useExportGuestList();

  // State for selected event
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Fetch event stats for selected event
  const { data: eventStats } = useEventStats(selectedEventId || undefined, {
    enabled: !!selectedEventId,
  });

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Set first event as selected by default
  useEffect(() => {
    if (eventsData && eventsData.length > 0 && !selectedEventId) {
      setSelectedEventId(eventsData[0].id);
    }
  }, [eventsData, selectedEventId]);

  // Handle export for the most recent event
  const handleExport = () => {
    if (stats?.recent_events && stats.recent_events.length > 0) {
      const mostRecentEvent = stats.recent_events[0];
      exportMutation.mutate(mostRecentEvent.id);
    }
  };

  // Handle event selection change
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = parseInt(e.target.value);
    setSelectedEventId(eventId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-primary-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-900/20 border border-red-800 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-light mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-300">
            {error?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentage change (placeholder for now since API doesn't provide it)
  const getPercentageChange = () => "+12.5%";
  const getTrend = () => "up";

  // Stats Cards Data
  const statsCards = [
    {
      id: 1,
      title: "Total Events",
      value: stats?.total_events?.toString() || "0",
      change: getPercentageChange(),
      trend: getTrend(),
      icon: Calendar,
      color: "from-primary-600 to-primary-800",
      bgColor: "bg-primary-900/20",
    },
    {
      id: 2,
      title: "Total Guests",
      value: stats?.total_guests?.toLocaleString() || "0",
      change: getPercentageChange(),
      trend: getTrend(),
      icon: Users,
      color: "from-primary-600 to-primary-800",
      bgColor: "bg-primary-900/20",
    },
    {
      id: 3,
      title: "Upcoming Events",
      value: stats?.upcoming_events?.toString() || "0",
      change: getPercentageChange(),
      trend: getTrend(),
      icon: QrCode,
      color: "from-primary-600 to-primary-800",
      bgColor: "bg-primary-900/20",
    },
    {
      id: 4,
      title: "Check-in Rate",
      value: `${stats?.attendance_rate || 0}%`,
      change: getPercentageChange(),
      trend: getTrend(),
      icon: CheckCircle,
      color: "from-primary-600 to-primary-800",
      bgColor: "bg-primary-900/20",
    },
  ];

  // Recent Activities (mock data - could be enhanced with real API data)
  const recentActivities = [
    {
      id: 1,
      type: "event_created",
      message: stats?.recent_events?.[0]
        ? `Event "${stats.recent_events[0].title}" is ${stats.recent_events[0].status}`
        : "No recent events",
      time: stats?.recent_events?.[0]
        ? new Date(stats.recent_events[0].event_date).toLocaleDateString()
        : "N/A",
      icon: Calendar,
      color: "text-primary-400",
    },
    {
      id: 2,
      type: "guest_added",
      message: `${stats?.total_guests || 0} total guests registered`,
      time: "Today",
      icon: Users,
      color: "text-primary-400",
    },
    {
      id: 3,
      type: "checkin",
      message: `${stats?.total_checked_in || 0} guests checked in`,
      time: "Today",
      icon: CheckCircle,
      color: "text-primary-400",
    },
    {
      id: 4,
      type: "qr_generated",
      message: "QR codes ready for upcoming events",
      time: "Today",
      icon: QrCode,
      color: "text-primary-400",
    },
    {
      id: 5,
      type: "alert",
      message: `${stats?.upcoming_events || 0} events coming up`,
      time: "This week",
      icon: AlertCircle,
      color: "text-yellow-400",
    },
  ];

  // Get selected event details
  const selectedEvent = eventsData?.find((e) => e.id === selectedEventId);

  // Chart Data from selected event stats
  const chartData = eventStats?.guests
    ? [
        { label: "Total Guests", value: eventStats.guests.total },
        { label: "Confirmed", value: eventStats.guests.confirmed },
        { label: "Checked In", value: eventStats.guests.checked_in },
        { label: "Pending", value: eventStats.guests.pending },
        { label: "Declined", value: eventStats.guests.declined },
      ]
    : selectedEvent
      ? [
          { label: "Total", value: selectedEvent.total_guests || 0 },
          { label: "Checked In", value: selectedEvent.checked_in_count || 0 },
          {
            label: "Pending",
            value:
              (selectedEvent.total_guests || 0) -
              (selectedEvent.checked_in_count || 0),
          },
        ]
      : [];

  const maxValue = Math.max(...chartData.map((d) => d.value), 1); // Minimum 1 to avoid division by zero

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Dashboard
          </h1>
          <p className="text-primary-300">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exportMutation.isPending || !stats?.recent_events?.length}
            className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Export Report
          </button>
          <Link to="/dashboard/create-event">
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2">
              <Calendar size={18} />
              Create Event
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={stat.id}
            data-aos="fade-up"
            data-aos-delay={index * 100}
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-700 transition-all hover:shadow-lg hover:shadow-primary-900/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon size={24} className="text-primary-400" />
              </div>
              <button className="p-1 hover:bg-primary-900 rounded transition-colors">
                <MoreVertical size={18} className="text-primary-500" />
              </button>
            </div>
            <div>
              <p className="text-primary-400 text-sm mb-1">{stat.title}</p>
              <h3 className="font-heading text-3xl font-bold text-light mb-2">
                {stat.value}
              </h3>
              <div className="flex items-center gap-1">
                {stat.trend === "up" ? (
                  <TrendingUp size={16} className="text-green-400" />
                ) : (
                  <TrendingDown size={16} className="text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-primary-500">vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Event Statistics Chart */}
        <div className="lg:col-span-2" data-aos="fade-up">
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-light mb-1">
                  {selectedEvent
                    ? `${selectedEvent.title} Statistics`
                    : "Event Statistics"}
                </h3>
                <p className="text-sm text-primary-400">
                  Guest breakdown and attendance
                </p>
              </div>
              {eventsData && eventsData.length > 0 && (
                <select
                  className="px-3 py-2 bg-dark border border-primary-800 text-primary-300 rounded-lg text-sm focus:outline-none focus:border-primary-600"
                  value={selectedEventId || ""}
                  onChange={handleEventChange}
                >
                  {eventsData.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Event Stats Summary */}
            {eventStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary-900/20 rounded-lg p-3">
                  <p className="text-xs text-primary-400 mb-1">Total Guests</p>
                  <p className="text-2xl font-bold text-light">
                    {eventStats.guests.total}
                  </p>
                </div>
                <div className="bg-green-900/20 rounded-lg p-3">
                  <p className="text-xs text-green-400 mb-1">Checked In</p>
                  <p className="text-2xl font-bold text-light">
                    {eventStats.guests.checked_in}
                  </p>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400 mb-1">Confirmed</p>
                  <p className="text-2xl font-bold text-light">
                    {eventStats.guests.confirmed}
                  </p>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-400 mb-1">Attendance</p>
                  <p className="text-2xl font-bold text-light">
                    {eventStats.attendance_rate}%
                  </p>
                </div>
              </div>
            )}

            {/* Bar Chart */}
            {chartData.length > 0 ? (
              <div className="space-y-4">
                {chartData.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm text-primary-400 w-24 truncate">
                      {data.label}
                    </span>
                    <div className="flex-1 h-10 bg-primary-900/30 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-linear-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-end pr-3 transition-all duration-1000"
                        style={{ width: `${(data.value / maxValue) * 100}%` }}
                      >
                        <span className="text-sm font-semibold text-light">
                          {data.value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-primary-400">
                No event data available. Create an event to see statistics.
              </div>
            )}

            {/* Capacity Information */}
            {eventStats?.capacity && (
              <div className="mt-6 pt-6 border-t border-primary-800">
                <h4 className="text-sm font-semibold text-primary-300 mb-3">
                  Capacity
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-primary-400">
                        {eventStats.capacity.used} / {eventStats.capacity.total}
                      </span>
                      <span className="text-primary-300">
                        {(
                          (eventStats.capacity.used /
                            eventStats.capacity.total) *
                          100
                        ).toFixed(1)}
                        % Full
                      </span>
                    </div>
                    <div className="h-2 bg-primary-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary-600 to-primary-700 transition-all duration-1000"
                        style={{
                          width: `${(eventStats.capacity.used / eventStats.capacity.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-primary-400">Available</p>
                    <p className="text-xl font-bold text-light">
                      {eventStats.capacity.available}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div data-aos="fade-up" data-aos-delay="100">
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-light">
                Recent Activity
              </h3>
              <Link
                to="/dashboard/events"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <div
                    className={`p-2 bg-primary-900/30 rounded-lg ${activity.color}`}
                  >
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-light mb-1">
                      {activity.message}
                    </p>
                    <span className="text-xs text-primary-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      {stats?.recent_events && stats.recent_events.length > 0 && (
        <div data-aos="fade-up">
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
            <h3 className="font-heading text-xl font-bold text-light mb-4">
              Recent Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.recent_events.map((event) => (
                <Link
                  key={event.id}
                  to={`/dashboard/events/${event.id}`}
                  className="p-4 border border-primary-800 rounded-lg hover:border-primary-600 transition-all hover:bg-primary-900/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-light">{event.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        event.status === "published"
                          ? "bg-green-900/30 text-green-400"
                          : event.status === "draft"
                            ? "bg-yellow-900/30 text-yellow-400"
                            : "bg-gray-900/30 text-gray-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-primary-400">
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
