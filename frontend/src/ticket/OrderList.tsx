import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  DollarSign,
  Package,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";

interface Order {
  id: number;
  order_number: string;
  event_title: string;
  event_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  ticket_items: {
    ticket_type_name: string;
    quantity: number;
    unit_price: number;
  }[];
  total_tickets: number;
  created_at: string;
}

const OrdersList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("all");

  // Mock data
  const events = [
    { id: 1, title: "Birthday Party" },
    { id: 2, title: "Tech Conference 2024" },
    { id: 3, title: "Music Festival" },
  ];

  const ticketTypes = [
    { id: 1, name: "VIP Pass" },
    { id: 2, name: "Premium" },
    { id: 3, name: "General Admission" },
    { id: 4, name: "Early Bird" },
  ];

  const orders: Order[] = [
    {
      id: 1,
      order_number: "ORD-ABC123DEF456",
      event_title: "Tech Conference 2024",
      event_id: 2,
      customer_name: "John Doe",
      customer_email: "john@example.com",
      customer_phone: "+1234567890",
      total_amount: 450.0,
      status: "completed",
      payment_status: "successful",
      payment_method: "paystack",
      ticket_items: [
        { ticket_type_name: "VIP Pass", quantity: 2, unit_price: 150.0 },
        { ticket_type_name: "Premium", quantity: 1, unit_price: 150.0 },
      ],
      total_tickets: 3,
      created_at: "2024-02-15T10:30:00Z",
    },
    {
      id: 2,
      order_number: "ORD-GHI789JKL012",
      event_title: "Music Festival",
      event_id: 3,
      customer_name: "Jane Smith",
      customer_email: "jane@example.com",
      customer_phone: "+1234567891",
      total_amount: 200.0,
      status: "pending",
      payment_status: "pending",
      payment_method: "",
      ticket_items: [
        {
          ticket_type_name: "General Admission",
          quantity: 4,
          unit_price: 50.0,
        },
      ],
      total_tickets: 4,
      created_at: "2024-02-15T11:45:00Z",
    },
    {
      id: 3,
      order_number: "ORD-MNO345PQR678",
      event_title: "Birthday Party",
      event_id: 1,
      customer_name: "Bob Johnson",
      customer_email: "bob@example.com",
      customer_phone: "+1234567892",
      total_amount: 160.0,
      status: "cancelled",
      payment_status: "refunded",
      payment_method: "stripe",
      ticket_items: [
        { ticket_type_name: "Early Bird", quantity: 4, unit_price: 40.0 },
      ],
      total_tickets: 4,
      created_at: "2024-02-14T14:20:00Z",
    },
    {
      id: 4,
      order_number: "ORD-STU901VWX234",
      event_title: "Tech Conference 2024",
      event_id: 2,
      customer_name: "Alice Williams",
      customer_email: "alice@example.com",
      customer_phone: "+1234567893",
      total_amount: 300.0,
      status: "completed",
      payment_status: "successful",
      payment_method: "paystack",
      ticket_items: [
        { ticket_type_name: "Premium", quantity: 3, unit_price: 100.0 },
      ],
      total_tickets: 3,
      created_at: "2024-02-14T16:00:00Z",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent =
      selectedEvent === "all" || order.event_id.toString() === selectedEvent;

    const matchesTicketType =
      selectedTicketType === "all" ||
      order.ticket_items.some(
        (item) => item.ticket_type_name === selectedTicketType,
      );

    const matchesStatus =
      selectedStatus === "all" || order.status === selectedStatus;

    const matchesPaymentStatus =
      selectedPaymentStatus === "all" ||
      order.payment_status === selectedPaymentStatus;

    return (
      matchesSearch &&
      matchesEvent &&
      matchesTicketType &&
      matchesStatus &&
      matchesPaymentStatus
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-900/30 text-green-400 border-green-800",
      pending: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
      processing: "bg-blue-900/30 text-blue-400 border-blue-800",
      cancelled: "bg-red-900/30 text-red-400 border-red-800",
      refunded: "bg-gray-900/30 text-gray-400 border-gray-800",
      failed: "bg-red-900/30 text-red-400 border-red-800",
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      successful: "text-green-400",
      pending: "text-yellow-400",
      processing: "text-blue-400",
      failed: "text-red-400",
      refunded: "text-gray-400",
    };
    return colors[status] || colors.pending;
  };

  const stats = {
    total_orders: orders.length,
    completed_orders: orders.filter((o) => o.status === "completed").length,
    total_revenue: orders
      .filter((o) => o.payment_status === "successful")
      .reduce((sum, o) => sum + o.total_amount, 0),
    total_tickets: orders.reduce((sum, o) => sum + o.total_tickets, 0),
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportOrders = () => {
    console.log("Exporting orders...");
    // TODO: Implement CSV export
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Orders
          </h1>
          <p className="text-primary-300">Manage and track all ticket orders</p>
        </div>
        <button
          onClick={handleExportOrders}
          className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2"
        >
          <Download size={18} />
          Export Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-900/20 rounded-lg">
              <ShoppingCart className="text-primary-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-primary-400">Total Orders</p>
              <p className="text-2xl font-bold text-light">
                {stats.total_orders}
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
              <CheckCircle className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-green-400">Completed</p>
              <p className="text-2xl font-bold text-light">
                {stats.completed_orders}
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
            <div className="p-3 bg-green-900/20 rounded-lg">
              <DollarSign className="text-green-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-green-400">Total Revenue</p>
              <p className="text-2xl font-bold text-light">
                ${stats.total_revenue.toLocaleString()}
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
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <Package className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-blue-400">Total Tickets</p>
              <p className="text-2xl font-bold text-light">
                {stats.total_tickets}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                placeholder="Order, customer..."
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
              {events.map((event) => (
                <option key={event.id} value={event.id.toString()}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Type Filter */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">
              Ticket Type
            </label>
            <select
              value={selectedTicketType}
              onChange={(e) => setSelectedTicketType(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
            >
              <option value="all">All Types</option>
              {ticketTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Order Status Filter */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">
              Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-xs text-primary-400 mb-2">
              Payment Status
            </label>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="successful">Successful</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div data-aos="fade-up" className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <div
              key={order.id}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 hover:border-primary-700 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-primary-900/20 rounded-lg">
                      <ShoppingCart className="text-primary-400" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-heading text-lg font-bold text-light">
                          {order.order_number}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-primary-400">
                          <span className="text-primary-500">Event:</span>{" "}
                          {order.event_title}
                        </p>
                        <p className="text-primary-400">
                          <span className="text-primary-500">Customer:</span>{" "}
                          {order.customer_name} ({order.customer_email})
                        </p>
                        <p className="text-primary-400 flex items-center gap-2">
                          <Calendar size={14} />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Items */}
                  <div className="ml-16 space-y-2">
                    {order.ticket_items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-primary-900/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Package size={16} className="text-primary-500" />
                          <span className="text-sm text-light">
                            {item.ticket_type_name}
                          </span>
                          <span className="text-xs text-primary-400">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-light">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Actions */}
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-xs text-primary-400 mb-1">
                      Total Amount
                    </p>
                    <p className="text-3xl font-bold text-green-400">
                      ${order.total_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      {order.total_tickets} ticket
                      {order.total_tickets !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary-400">Payment:</span>
                      <span
                        className={`text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                    {order.payment_method && (
                      <span className="text-xs text-primary-500">
                        via {order.payment_method}
                      </span>
                    )}
                  </div>

                  <Link to={`/ticket/${order.id}`}>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all flex items-center gap-2">
                      <Eye size={16} />
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-light mb-2">
              No Orders Found
            </h3>
            <p className="text-primary-400">
              {searchQuery ||
              selectedEvent !== "all" ||
              selectedTicketType !== "all" ||
              selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "No orders have been placed yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
