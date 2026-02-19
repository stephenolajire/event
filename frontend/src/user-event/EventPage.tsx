import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Users,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import AOS from "aos";
import { toast } from "react-toastify";
import eventService from "../services/eventService";
import {
  type PublicTicketType,
} from "../services/ticketService";
import ticketService from "../services/ticketService";

interface Event {
  id: number;
  slug: string;
  title: string;
  description: string;
  event_date: string;
  event_end_date?: string;
  location: string;
  venue_name?: string;
  banner_image?: string;
  organizer_name: string;
}

interface CartItem {
  ticket_type_id: number;
  name: string;
  price: number;
  quantity: number;
}

const EventTicketPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<PublicTicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

useEffect(() => {
  const fetchEventAndTickets = async () => {
    if (!slug) {
      setError("Event not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventData = await eventService.getEventBySlug(slug);
      console.log("Event Data:", eventData);
      setEvent(eventData);

      // Fetch ticket types for this event
      console.log("Fetching tickets for event ID:", eventData.id);
      const tickets = await ticketService.getPublicTicketTypes(eventData.id);
      console.log("Tickets received:", tickets);
      setTicketTypes(tickets);

      if (tickets.length === 0) {
        console.warn(
          "No tickets found. Checking all tickets for this event...",
        );
        // Try fetching without the 'available' filter to see if tickets exist
        const allTickets = await ticketService.getTicketTypes({
          event: eventData.id,
        });
        console.log("All tickets (including unavailable):", allTickets);
      }
    } catch (err: any) {
      console.error("Error fetching event:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.detail || "Failed to load event details");
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  fetchEventAndTickets();
}, [slug]);

  console.log(ticketTypes)

  const handleQuantityChange = (ticketId: number, change: number) => {
    const ticket = ticketTypes.find((t) => t.id === ticketId);
    if (!ticket) return;

    const currentQuantity = selectedTickets[ticketId] || 0;
    const newQuantity = Math.max(
      0,
      Math.min(
        currentQuantity + change,
        ticket.max_purchase,
        ticket.quantity_remaining,
      ),
    );

    if (newQuantity === 0) {
      const { [ticketId]: _, ...rest } = selectedTickets;
      setSelectedTickets(rest);
    } else {
      setSelectedTickets((prev) => ({
        ...prev,
        [ticketId]: newQuantity,
      }));
    }
  };

  const getTotalAmount = () => {
    return Object.entries(selectedTickets).reduce(
      (total, [ticketId, quantity]) => {
        const ticket = ticketTypes.find((t) => t.id === parseInt(ticketId));
        return total + (ticket?.price || 0) * quantity;
      },
      0,
    );
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce(
      (total, quantity) => total + quantity,
      0,
    );
  };

  const handleProceedToCheckout = () => {
    if (!event) return;

    const cart: CartItem[] = Object.entries(selectedTickets).map(
      ([ticketId, quantity]) => {
        const ticket = ticketTypes.find((t) => t.id === parseInt(ticketId))!;
        return {
          ticket_type_id: parseInt(ticketId),
          name: ticket.name,
          price: Number(ticket.price),
          quantity,
        };
      },
    );

    // Store cart in sessionStorage or state management
    sessionStorage.setItem("cart", JSON.stringify(cart));
    sessionStorage.setItem("eventId", event.id.toString());
    navigate("/event/checkout");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      vip: "from-purple-600 to-pink-600",
      vvip: "from-pink-600 to-purple-600",
      premium: "from-blue-600 to-cyan-600",
      general: "from-primary-600 to-primary-700",
      early_bird: "from-yellow-600 to-orange-600",
      student: "from-green-600 to-emerald-600",
      group: "from-orange-600 to-red-600",
    };
    return colors[category] || colors.general;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-primary-300">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-light mb-2">
            Event Not Found
          </h2>
          <p className="text-primary-400 mb-6">
            {error ||
              "The event you're looking for doesn't exist or is no longer available."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // No Tickets Available
  if (ticketTypes.length === 0) {
    return (
      <div className="min-h-screen bg-dark">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          {event.banner_image ? (
            <img
              src={event.banner_image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary-900/30 to-primary-800/30 flex items-center justify-center">
              <Calendar size={80} className="text-primary-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-light mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-light">
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{formatTime(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="font-heading text-2xl font-bold text-light mb-2">
              No Tickets Available
            </h3>
            <p className="text-primary-400">
              Tickets for this event are not currently available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {event.banner_image ? (
          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary-900/30 to-primary-800/30 flex items-center justify-center">
            <Calendar size={80} className="text-primary-500" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-dark via-dark/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-light mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-light">
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>{formatDate(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{formatTime(event.event_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            {event.description && (
              <div
                data-aos="fade-up"
                className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
              >
                <h2 className="font-heading text-2xl font-bold text-light mb-4">
                  About This Event
                </h2>
                <p className="text-primary-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Tickets */}
            <div data-aos="fade-up" data-aos-delay="100">
              <h2 className="font-heading text-2xl font-bold text-light mb-6">
                Select Your Tickets
              </h2>
              <div className="space-y-4">
                {ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-700 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-1 h-12 rounded-full bg-linear-to-b ${getCategoryColor(ticket.category)}`}
                          />
                          <div>
                            <h3 className="font-heading text-xl font-bold text-light">
                              {ticket.name}
                            </h3>
                            {ticket.description && (
                              <p className="text-sm text-primary-400">
                                {ticket.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Benefits */}
                        {ticket.benefits && ticket.benefits.length > 0 && (
                          <div className="ml-4 space-y-2">
                            {ticket.benefits.map((benefit, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm text-primary-300"
                              >
                                <Check
                                  size={16}
                                  className="text-green-400 shrink-0"
                                />
                                <span>{benefit.title}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="ml-4 mt-3 flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-2 text-primary-500">
                            <Users size={14} />
                            <span>
                              {ticket.quantity_remaining} tickets remaining
                            </span>
                          </div>
                          {ticket.sold_out && (
                            <span className="px-2 py-1 bg-red-900/30 text-red-400 border border-red-800 rounded-full">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                          <p className="text-3xl font-bold text-light">
                            ${Number(ticket.price).toFixed(2)}
                          </p>
                          <p className="text-xs text-primary-500">per ticket</p>
                        </div>

                        {selectedTickets[ticket.id] ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleQuantityChange(ticket.id, -1)
                              }
                              className="w-10 h-10 flex items-center justify-center bg-primary-900/30 hover:bg-primary-900/50 text-light rounded-lg transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="text-xl font-bold text-light w-8 text-center">
                              {selectedTickets[ticket.id]}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(ticket.id, 1)}
                              disabled={
                                selectedTickets[ticket.id] >=
                                  ticket.max_purchase ||
                                selectedTickets[ticket.id] >=
                                  ticket.quantity_remaining
                              }
                              className="w-10 h-10 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuantityChange(ticket.id, 1)}
                            disabled={!ticket.is_available || ticket.sold_out}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {ticket.sold_out
                              ? "Sold Out"
                              : !ticket.is_available
                                ? "Not Available"
                                : "Select"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div
              data-aos="fade-up"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 sticky top-6"
            >
              <h3 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
                <ShoppingCart size={24} />
                Order Summary
              </h3>

              {getTotalTickets() > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {Object.entries(selectedTickets).map(
                      ([ticketId, quantity]) => {
                        const ticket = ticketTypes.find(
                          (t) => t.id === parseInt(ticketId),
                        );
                        if (!ticket) return null;

                        return (
                          <div
                            key={ticketId}
                            className="flex items-center justify-between p-3 bg-primary-900/20 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-light">
                                {ticket.name}
                              </p>
                              <p className="text-xs text-primary-400">
                                ${Number(ticket.price).toFixed(2)} × {quantity}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-light">
                              ${(Number(ticket.price) * quantity).toFixed(2)}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>

                  <div className="border-t border-primary-800 pt-4 mb-6">
                    <div className="flex justify-between text-primary-300 mb-2">
                      <span>Total Tickets</span>
                      <span>{getTotalTickets()}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-light">
                      <span>Total</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-bold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <p className="text-primary-400">No tickets selected</p>
                  <p className="text-sm text-primary-500 mt-2">
                    Select tickets to continue
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Important Information</p>
                    <p className="text-xs text-blue-400">
                      Tickets will be sent to your email after payment
                      confirmation. Please bring your ticket (digital or
                      printed) to the event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTicketPage;
