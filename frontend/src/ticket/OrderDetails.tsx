import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Package,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AOS from "aos";

const OrderDetails = () => {
  const { orderId } = useParams();
  console.log(orderId)
  const [isRefunding, setIsRefunding] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Mock data - replace with API call
  const order = {
    id: 1,
    order_number: "ORD-ABC123DEF456",
    event: {
      id: 2,
      title: "Tech Conference 2024",
      date: "2024-12-15T09:00:00Z",
      location: "Convention Center, Lagos",
    },
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 801 234 5678",
      ip_address: "192.168.1.1",
    },
    items: [
      {
        id: 1,
        ticket_type: "VIP Pass",
        category: "vip",
        quantity: 2,
        unit_price: 150.0,
        total_price: 300.0,
        benefits: ["VIP Lounge Access", "2 VSOP Drinks", "Meet & Greet"],
      },
      {
        id: 2,
        ticket_type: "Premium",
        category: "premium",
        quantity: 1,
        unit_price: 100.0,
        total_price: 100.0,
        benefits: ["Premium Seating", "1 Complimentary Drink"],
      },
    ],
    pricing: {
      subtotal: 400.0,
      discount: 50.0,
      tax: 0.0,
      total: 350.0,
    },
    payment: {
      status: "successful",
      method: "Paystack",
      reference: "PSK_abc123xyz789",
      date: "2024-02-15T10:30:00Z",
    },
    status: "completed",
    notes: "Customer requested early check-in",
    created_at: "2024-02-15T10:30:00Z",
    updated_at: "2024-02-15T10:35:00Z",
  };

  const tickets = [
    {
      id: 1,
      ticket_number: "TKT-001-ABC123",
      holder_name: "John Doe",
      ticket_type: "VIP Pass",
      status: "valid",
      checked_in: false,
    },
    {
      id: 2,
      ticket_number: "TKT-002-DEF456",
      holder_name: "John Doe",
      ticket_type: "VIP Pass",
      status: "valid",
      checked_in: false,
    },
    {
      id: 3,
      ticket_number: "TKT-003-GHI789",
      holder_name: "John Doe",
      ticket_type: "Premium",
      status: "valid",
      checked_in: false,
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  const handleRefund = async () => {
    if (
      !window.confirm(
        "Are you sure you want to refund this order? This action cannot be undone.",
      )
    )
      return;

    setIsRefunding(true);
    try {
      // TODO: API call to refund
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Order refunded successfully");
    } catch (error) {
      console.error("Refund error:", error);
    } finally {
      setIsRefunding(false);
    }
  };

  const handleResendTickets = async () => {
    setIsResending(true);
    try {
      // TODO: API call to resend tickets
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Tickets resent successfully");
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-900/30 text-green-400 border-green-800",
      pending: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
      processing: "bg-blue-900/30 text-blue-400 border-blue-800",
      cancelled: "bg-red-900/30 text-red-400 border-red-800",
      refunded: "bg-gray-900/30 text-gray-400 border-gray-800",
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-light mb-2">
              Order Details
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-primary-300 font-mono">{order.order_number}</p>
              <span
                className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResendTickets}
              disabled={isResending}
              className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Resend Tickets
                </>
              )}
            </button>
            {order.status === "completed" && (
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="px-4 py-2 bg-red-900/20 border border-red-800 hover:border-red-600 text-red-400 rounded-lg font-medium transition-all hover:bg-red-900/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isRefunding ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    Refund Order
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <div
            data-aos="fade-up"
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
              <Calendar className="text-primary-400" size={24} />
              Event Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-primary-400 mb-1">Event Name</p>
                <p className="text-lg font-semibold text-light">
                  {order.event.title}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-primary-400 mb-1">Date & Time</p>
                  <p className="text-light">{formatDate(order.event.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-primary-400 mb-1">Location</p>
                  <p className="text-light flex items-center gap-2">
                    <MapPin size={16} className="text-primary-500" />
                    {order.event.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
              <Package className="text-primary-400" size={24} />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-primary-900/10 border border-primary-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-light">
                          {item.ticket_type}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.category === "vip"
                              ? "bg-purple-900/30 text-purple-400"
                              : item.category === "premium"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-primary-900/30 text-primary-400"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-primary-400">
                        <span>Qty: {item.quantity}</span>
                        <span>×</span>
                        <span>${item.unit_price.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-light">
                      ${item.total_price.toFixed(2)}
                    </p>
                  </div>
                  {item.benefits.length > 0 && (
                    <div className="pt-3 border-t border-primary-800">
                      <p className="text-xs text-primary-500 mb-2">Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-primary-900/20 text-primary-300 rounded"
                          >
                            ✓ {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="mt-6 pt-6 border-t border-primary-800 space-y-2">
              <div className="flex justify-between text-primary-300">
                <span>Subtotal</span>
                <span>${order.pricing.subtotal.toFixed(2)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${order.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              {order.pricing.tax > 0 && (
                <div className="flex justify-between text-primary-300">
                  <span>Tax</span>
                  <span>${order.pricing.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-light pt-2 border-t border-primary-800">
                <span>Total</span>
                <span>${order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
              <Ticket className="text-primary-400" size={24} />
              Generated Tickets ({tickets.length})
            </h2>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-primary-900/10 border border-primary-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Ticket className="text-primary-400" size={20} />
                    <div>
                      <p className="font-mono text-sm text-light">
                        {ticket.ticket_number}
                      </p>
                      <p className="text-xs text-primary-400">
                        {ticket.ticket_type} • {ticket.holder_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ticket.checked_in ? (
                      <span className="text-xs px-3 py-1 bg-green-900/30 text-green-400 border border-green-800 rounded-full flex items-center gap-1">
                        <CheckCircle size={14} />
                        Checked In
                      </span>
                    ) : (
                      <span className="text-xs px-3 py-1 bg-yellow-900/30 text-yellow-400 border border-yellow-800 rounded-full flex items-center gap-1">
                        <Clock size={14} />
                        {ticket.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div
            data-aos="fade-up"
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
              <User className="text-primary-400" size={24} />
              Customer
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-primary-400 mb-1">Name</p>
                <p className="text-light font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">Email</p>
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-light hover:text-primary-300 transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  {order.customer.email}
                </a>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">Phone</p>
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-light hover:text-primary-300 transition-colors flex items-center gap-2"
                >
                  <Phone size={16} />
                  {order.customer.phone}
                </a>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">IP Address</p>
                <p className="text-light text-sm font-mono">
                  {order.customer.ip_address}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
              <CreditCard className="text-primary-400" size={24} />
              Payment
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-primary-400 mb-1">Status</p>
                <span
                  className={`inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                    order.payment.status === "successful"
                      ? "bg-green-900/30 text-green-400 border border-green-800"
                      : "bg-yellow-900/30 text-yellow-400 border border-yellow-800"
                  }`}
                >
                  {order.payment.status === "successful" ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {order.payment.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">Method</p>
                <p className="text-light">{order.payment.method}</p>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">Reference</p>
                <p className="text-light text-sm font-mono">
                  {order.payment.reference}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">Payment Date</p>
                <p className="text-light text-sm">
                  {formatDate(order.payment.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div
            data-aos="fade-up"
            data-aos-delay="200"
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
          >
            <h2 className="font-heading text-xl font-bold text-light mb-4">
              Timeline
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-primary-400 mb-1">Created</p>
                <p className="text-light text-sm">
                  {formatDate(order.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-400 mb-1">Last Updated</p>
                <p className="text-light text-sm">
                  {formatDate(order.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
            >
              <h2 className="font-heading text-xl font-bold text-light mb-4">
                Notes
              </h2>
              <p className="text-primary-300 text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
