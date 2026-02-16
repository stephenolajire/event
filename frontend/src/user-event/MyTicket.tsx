import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Calendar,
  MapPin,
  CheckCircle,
} from "lucide-react";
import AOS from "aos";

interface TicketData {
  id: number;
  ticket_number: string;
  ticket_code: string;
  event_title: string;
  event_date: string;
  event_location: string;
  ticket_type: string;
  holder_name: string;
  holder_email: string;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  order_number: string;
  qr_code_url: string;
}

const MyTickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock tickets data
  const tickets: TicketData[] = [
    {
      id: 1,
      ticket_number: "TKT-001-ABC123",
      ticket_code: "abc123-def456-ghi789",
      event_title: "Tech Conference 2024",
      event_date: "2024-12-15T09:00:00Z",
      event_location: "Convention Center, Lagos",
      ticket_type: "VIP Pass",
      holder_name: "John Doe",
      holder_email: "john@example.com",
      status: "valid",
      checked_in: false,
      checked_in_at: null,
      order_number: "ORD-ABC123DEF456",
      qr_code_url:
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TKT-001-ABC123",
    },
    {
      id: 2,
      ticket_number: "TKT-002-DEF456",
      ticket_code: "def456-ghi789-jkl012",
      event_title: "Tech Conference 2024",
      event_date: "2024-12-15T09:00:00Z",
      event_location: "Convention Center, Lagos",
      ticket_type: "VIP Pass",
      holder_name: "John Doe",
      holder_email: "john@example.com",
      status: "valid",
      checked_in: false,
      checked_in_at: null,
      order_number: "ORD-ABC123DEF456",
      qr_code_url:
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TKT-002-DEF456",
    },
    {
      id: 3,
      ticket_number: "TKT-003-GHI789",
      ticket_code: "ghi789-jkl012-mno345",
      event_title: "Music Festival",
      event_date: "2024-11-20T18:00:00Z",
      event_location: "Open Grounds, Abuja",
      ticket_type: "General Admission",
      holder_name: "John Doe",
      holder_email: "john@example.com",
      status: "used",
      checked_in: true,
      checked_in_at: "2024-11-20T17:45:00Z",
      order_number: "ORD-XYZ789ABC012",
      qr_code_url:
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TKT-003-GHI789",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.order_number.toLowerCase().includes(searchQuery.toLowerCase());

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

  const getStatusColor = (ticket: TicketData) => {
    if (ticket.checked_in) {
      return "bg-gray-900/30 text-gray-400 border-gray-800";
    }
    if (ticket.status === "valid") {
      return "bg-green-900/30 text-green-400 border-green-800";
    }
    return "bg-red-900/30 text-red-400 border-red-800";
  };

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
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          data-aos="fade-up"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, ticket number..."
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

        {/* Tickets Grid - Updated for better sizing */}
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
                        {ticket.event_title}
                      </h3>
                      <p className="text-primary-300 text-sm">
                        {ticket.ticket_type}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                        ticket,
                      )}`}
                    >
                      {ticket.checked_in ? "Used" : ticket.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column - Event Details & Info */}
                    <div className="flex-1 space-y-4">
                      {/* Event Details */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 text-primary-200">
                          <Calendar className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">
                            {formatDate(ticket.event_date)}
                          </span>
                        </div>
                        <div className="flex items-start gap-3 text-primary-200">
                          <MapPin className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">
                            {ticket.event_location}
                          </span>
                        </div>
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
                          <span className="text-primary-400">Order Number</span>
                          <span className="text-light font-mono">
                            {ticket.order_number}
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

                    {/* Right Column - QR Code */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-white p-3 rounded-lg">
                        <img
                          src={ticket.qr_code_url}
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
                : "You haven't purchased any tickets yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
