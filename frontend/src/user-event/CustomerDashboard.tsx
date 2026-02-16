// src/pages/CustomerDashboard.tsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react";
import AOS from "aos";
import { useTickets } from "../hooks/useTicket";
import { useUserProfile } from "../hooks/useUser";
import { useUpcomingEvents } from "../hooks/useEvent";

const CustomerDashboard = () => {
  const { data: user } = useUserProfile();
  const { data: tickets } = useTickets({ email: user?.email });
  const { data: upcomingEvents } = useUpcomingEvents();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Calculate stats
  const totalTickets = tickets?.length || 0;
  const upcomingTickets =
    tickets?.filter((t:any) => !t.checked_in && t.status === "valid").length || 0;
  const usedTickets = tickets?.filter((t:any) => t.checked_in).length || 0;

  const statsCards = [
    {
      id: 1,
      title: "Total Tickets",
      value: totalTickets,
      icon: Ticket,
      bgColor: "bg-primary-900/20",
      textColor: "text-primary-400",
    },
    {
      id: 2,
      title: "Upcoming Events",
      value: upcomingTickets,
      icon: Calendar,
      bgColor: "bg-green-900/20",
      textColor: "text-green-400",
    },
    {
      id: 3,
      title: "Used Tickets",
      value: usedTickets,
      icon: ShoppingBag,
      bgColor: "bg-blue-900/20",
      textColor: "text-blue-400",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-950 via-dark to-primary-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div data-aos="fade-down" className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-light mb-2">
            Welcome back, {user?.first_name || "Guest"}! 👋
          </h1>
          <p className="text-primary-300 text-lg">
            Here's what's happening with your events and tickets
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={stat.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-700 transition-all hover:shadow-lg hover:shadow-primary-900/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <stat.icon size={24} className={stat.textColor} />
                </div>
              </div>
              <div>
                <p className="text-primary-400 text-sm mb-1">{stat.title}</p>
                <h3 className="font-heading text-4xl font-bold text-light">
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div data-aos="fade-up" data-aos-delay="200">
          <h2 className="font-heading text-2xl font-bold text-light mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/event/browse-events"
              className="group bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-600 transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-900/20 rounded-lg group-hover:bg-primary-600 transition-colors">
                  <Calendar
                    size={24}
                    className="text-primary-400 group-hover:text-light"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-light mb-1">
                    Browse Events
                  </h3>
                  <p className="text-sm text-primary-400">
                    Find exciting events
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/event/tickets"
              className="group bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-600 transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-900/20 rounded-lg group-hover:bg-green-600 transition-colors">
                  <Ticket
                    size={24}
                    className="text-green-400 group-hover:text-light"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-light mb-1">My Tickets</h3>
                  <p className="text-sm text-primary-400">
                    View all your tickets
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/profile"
              className="group bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-600 transition-all hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/20 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <TrendingUp
                    size={24}
                    className="text-blue-400 group-hover:text-light"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-light mb-1">Profile</h3>
                  <p className="text-sm text-primary-400">
                    Manage your account
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Tickets */}
        <div data-aos="fade-up" data-aos-delay="300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-2xl font-bold text-light">
              Your Recent Tickets
            </h2>
            <Link
              to="/event/tickets"
              className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
            >
              View All →
            </Link>
          </div>

          {tickets && tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.slice(0, 4).map((ticket:any) => (
                <div
                  key={ticket.id}
                  className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-light mb-1">
                        {ticket.event_title}
                      </h3>
                      <p className="text-sm text-primary-400">
                        {ticket.ticket_type_name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.checked_in
                          ? "bg-gray-900/30 text-gray-400"
                          : ticket.status === "valid"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {ticket.checked_in ? "Used" : ticket.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {ticket.event_date && (
                      <div className="flex items-center gap-2 text-primary-300">
                        <Clock size={16} />
                        <span>
                          {new Date(ticket.event_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                    {ticket.event_location && (
                      <div className="flex items-center gap-2 text-primary-300">
                        <MapPin size={16} />
                        <span>{ticket.event_location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary-800">
                    <p className="text-xs text-primary-500">
                      Ticket: {ticket.ticket_number}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-12 text-center">
              <Ticket className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-light mb-2">
                No Tickets Yet
              </h3>
              <p className="text-primary-400 mb-6">
                Start exploring events and get your first ticket!
              </p>
              <Link
                to="/event/browse-events"
                className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div data-aos="fade-up" data-aos-delay="400">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-2xl font-bold text-light">
                Upcoming Events
              </h2>
              <Link
                to="/events"
                className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  to={`/event/${event.slug}/tickets`}
                  className="group bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl overflow-hidden hover:border-primary-600 transition-all hover:scale-105"
                >
                  {event.banner_image && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={event.banner_image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-light mb-2 group-hover:text-primary-400 transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1 text-sm text-primary-400">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
