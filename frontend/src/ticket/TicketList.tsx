import { useState, useEffect } from "react";
import {
  Ticket,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Package,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";
import { toast } from "react-toastify";
import { useTicketTypes, useDeleteTicketType } from "../hooks/useTicket";
import { useEvents } from "../hooks/useEvent";

interface TicketType {
  id: number;
  name: string;
  event: number;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  quantity_remaining: number;
  is_active: boolean;
  is_visible: boolean;
  sale_start_date: string;
  sale_end_date: string;
  benefits: any[];
  created_at: string;
  updated_at: string;
}

const TicketsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Fetch tickets and events from API
  const {
    data: tickets,
    isLoading: ticketsLoading,
    error: ticketsError,
  } = useTicketTypes();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const deleteTicketMutation = useDeleteTicketType();

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General Admission" },
    { value: "premium", label: "Premium" },
    { value: "vip", label: "VIP" },
    { value: "vvip", label: "VVIP" },
    { value: "early_bird", label: "Early Bird" },
    { value: "student", label: "Student" },
    { value: "group", label: "Group" },
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Filter tickets
  const filteredTickets =
    tickets?.filter((ticket: TicketType) => {
      // Get event title for search
      const eventTitle =
        events?.find((e) => e.id === ticket.event)?.title || "";

      const matchesSearch =
        ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEvent =
        selectedEvent === "all" || ticket.event.toString() === selectedEvent;

      const matchesCategory =
        selectedCategory === "all" || ticket.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && ticket.is_active) ||
        (selectedStatus === "inactive" && !ticket.is_active) ||
        (selectedStatus === "sold_out" && ticket.quantity_remaining === 0);

      return matchesSearch && matchesEvent && matchesCategory && matchesStatus;
    }) || [];

  const handleDelete = async (ticketId: number) => {
    if (window.confirm("Are you sure you want to delete this ticket type?")) {
      try {
        await deleteTicketMutation.mutateAsync(ticketId);
        toast.success("Ticket type deleted successfully!");
      } catch (error) {
        console.error("Error deleting ticket:", error);
        toast.error("Failed to delete ticket type");
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      vip: "bg-purple-900/30 text-purple-400 border-purple-800",
      premium: "bg-blue-900/30 text-blue-400 border-blue-800",
      general: "bg-primary-900/30 text-primary-400 border-primary-800",
      early_bird: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
      student: "bg-green-900/30 text-green-400 border-green-800",
      group: "bg-orange-900/30 text-orange-400 border-orange-800",
      vvip: "bg-pink-900/30 text-pink-400 border-pink-800",
    };
    return colors[category] || colors.general;
  };

  const stats = {
    total_tickets: tickets?.length || 0,
    active_tickets: tickets?.filter((t: TicketType) => t.is_active).length || 0,
    total_sold:
      tickets?.reduce(
        (sum: number, t: TicketType) => sum + Number(t.quantity_sold),
        0,
      ) || 0,
    total_revenue:
      tickets?.reduce(
        (sum: number, t: TicketType) =>
          sum + Number(t.price) * Number(t.quantity_sold),
        0,
      ) || 0,
  };

  // Get event title by ID
  const getEventTitle = (eventId: number) => {
    return events?.find((e) => e.id === eventId)?.title || "Unknown Event";
  };

  // Loading state
  if (ticketsLoading || eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-primary-300">Loading tickets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (ticketsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-light mb-2">
            Failed to Load Tickets
          </h3>
          <p className="text-primary-400">
            {(ticketsError as any).message ||
              "An error occurred while fetching tickets"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Ticket Types
          </h1>
          <p className="text-primary-300">
            Manage ticket types for your events
          </p>
        </div>
        <Link to="/ticket/create">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2">
            <Plus size={18} />
            Create Ticket Type
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-900/20 rounded-lg">
              <Package className="text-primary-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-primary-400">Total Types</p>
              <p className="text-2xl font-bold text-light">
                {stats.total_tickets}
              </p>
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-900/20 rounded-lg">
              <Ticket className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-green-400">Active Types</p>
              <p className="text-2xl font-bold text-light">
                {stats.active_tickets}
              </p>
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-blue-400">Total Sold</p>
              <p className="text-2xl font-bold text-light">
                {stats.total_sold.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="300"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-900/20 rounded-lg">
              <DollarSign className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-green-400">Total Revenue</p>
              <p className="text-2xl font-bold text-light">
                $
                {stats.total_revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        data-aos="fade-up"
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-primary-400" size={20} />
          <h2 className="font-heading text-lg font-bold text-light">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
              />
            </div>
          </div>

          {/* Event Filter */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
            >
              <option value="all">All Events</option>
              {events?.map((event) => (
                <option key={event.id} value={event.id.toString()}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div data-aos="fade-up" className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket: TicketType, index: number) => (
            <div
              key={ticket.id}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-700 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Ticket Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-3 bg-primary-900/20 rounded-lg">
                      <Ticket className="text-primary-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading text-xl font-bold text-light">
                          {ticket.name}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${getCategoryColor(ticket.category)}`}
                        >
                          {ticket.category}
                        </span>
                      </div>
                      <p className="text-sm text-primary-400 mb-2">
                        {getEventTitle(ticket.event)}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-green-400 font-bold">
                          ${Number(ticket.price).toFixed(2)}
                        </span>
                        <span className="text-primary-400">
                          {ticket.quantity_sold} / {ticket.quantity_available}{" "}
                          sold
                        </span>
                        <span
                          className={`font-medium ${
                            ticket.quantity_remaining === 0
                              ? "text-red-400"
                              : ticket.quantity_remaining < 10
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        >
                          {ticket.quantity_remaining} remaining
                        </span>
                        {ticket.benefits && ticket.benefits.length > 0 && (
                          <span className="text-primary-400">
                            {ticket.benefits.length} benefits
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="ml-14">
                    <div className="h-2 bg-primary-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary-600 to-primary-700 transition-all duration-500"
                        style={{
                          width: `${(Number(ticket.quantity_sold) / Number(ticket.quantity_available)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-row lg:flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    {ticket.is_active ? (
                      <span className="flex items-center gap-2 text-xs px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-xs px-3 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-full">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        Inactive
                      </span>
                    )}
                    {ticket.is_visible ? (
                      <Eye className="text-primary-400" size={16} />
                    ) : (
                      <EyeOff className="text-primary-600" size={16} />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/ticket/edit/${ticket.id}`}>
                      <button className="p-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      disabled={deleteTicketMutation.isPending}
                      className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteTicketMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-light mb-2">
              No Tickets Found
            </h3>
            <p className="text-primary-400 mb-4">
              {searchQuery ||
              selectedEvent !== "all" ||
              selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Create your first ticket type to get started"}
            </p>
            <Link to="/ticket/create">
              <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2 mx-auto">
                <Plus size={18} />
                Create Ticket Type
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsList;
