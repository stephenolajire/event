import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Calendar,
  MapPin,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AOS from "aos";
import ticketService from "../services/ticketService";
import type { Ticket as TicketType } from "../services/ticketService";

const MyTickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmailQuery] = useState("");

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ticketService.getTickets(
          email ? { email } : undefined,
        );
        setTickets(data);
      } catch (err: any) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [email]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      (ticket.event_title?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "upcoming" &&
        !ticket.checked_in &&
        ticket.status === "valid") ||
      (filterStatus === "used" && ticket.checked_in);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (ticket: TicketType) => {
    if (ticket.checked_in)
      return "bg-gray-900/30 text-gray-400 border-gray-800";
    if (ticket.status === "valid")
      return "bg-green-900/30 text-green-400 border-green-800";
    return "bg-red-900/30 text-red-400 border-red-800";
  };

  const getQRCodeUrl = (ticket: TicketType) => {
    // Use the qr_code field from API if available, otherwise generate from ticket_number
    if (ticket.qr_code) return ticket.qr_code;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ticket.ticket_number}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-950 via-dark to-primary-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-primary-300">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-950 via-dark to-primary-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-light mb-2">
            Something went wrong
          </h2>
          <p className="text-primary-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-950 via-dark to-primary-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8" data-aos="fade-down">
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-8 h-8 text-primary-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-light">
              My Tickets
            </h1>
          </div>
          <p className="text-primary-300 text-lg">
            View and manage all your event tickets
          </p>
        </div>

        {/* Filters */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          data-aos="fade-up"
        >
          {/* Email lookup */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
            <input
              type="email"
              placeholder="Enter your email to find tickets..."
              onBlur={(e) => setEmailQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  setEmailQuery((e.target as HTMLInputElement).value);
              }}
              className="w-full pl-10 pr-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event or ticket number..."
              className="w-full pl-10 pr-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
          >
            <option value="all">All Tickets</option>
            <option value="upcoming">Upcoming</option>
            <option value="used">Used</option>
          </select>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-linear-to-br from-primary-900/40 to-dark/60 backdrop-blur-sm border border-primary-800/50 rounded-xl overflow-hidden hover:border-primary-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/20"
              >
                {/* Ticket Header */}
                <div className="bg-linear-to-r from-primary-800/30 to-primary-900/30 px-6 py-4 border-b border-primary-800/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-light mb-1 truncate">
                        {ticket.event_title || "Event"}
                      </h3>
                      <p className="text-primary-300 text-sm">
                        {ticket.ticket_type_name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(ticket)}`}
                    >
                      {ticket.checked_in ? "Used" : ticket.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-3">
                        {ticket.event_date && (
                          <div className="flex items-start gap-3 text-primary-200">
                            <Calendar className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">
                              {formatDate(ticket.event_date)}
                            </span>
                          </div>
                        )}
                        {ticket.event_location && (
                          <div className="flex items-start gap-3 text-primary-200">
                            <MapPin className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">
                              {ticket.event_location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Info */}
                      <div className="pt-4 border-t border-primary-800/50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-400">
                            Ticket Number
                          </span>
                          <span className="text-light font-mono">
                            {ticket.ticket_number}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-400">Holder</span>
                          <span className="text-light">
                            {ticket.holder_name}
                          </span>
                        </div>
                      </div>

                      {/* Check-in Status */}
                      {ticket.checked_in && ticket.checked_in_at && (
                        <div className="flex items-center gap-2 p-3 bg-gray-900/30 border border-gray-800 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-semibold text-gray-400">
                              Checked In
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(ticket.checked_in_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-white p-3 rounded-lg">
                        <img
                          src={getQRCodeUrl(ticket)}
                          alt="QR Code"
                          className="w-32 h-32 md:w-36 md:h-36"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  {!ticket.checked_in && ticket.status === "valid" && (
                    <div className="mt-4 p-3 bg-primary-900/30 border border-primary-700/50 rounded-lg">
                      <p className="text-xs text-primary-300">
                        <strong>Important:</strong> Please present this QR code
                        at the event entrance. Keep it accessible on your phone
                        or print it out.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-16 bg-dark/40 rounded-xl border border-primary-800/50"
            data-aos="fade-up"
          >
            <Ticket className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-light mb-2">
              No Tickets Found
            </h3>
            <p className="text-primary-400">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : email
                  ? "No tickets found for this email address"
                  : "Enter your email address to find your tickets"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
