import { useEffect, useState } from "react";
import {
  Ticket,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ShoppingCart,
  Download,
  Package,
  Loader2,
} from "lucide-react";
import AOS from "aos";
import { Link } from "react-router-dom";
import { useEvents } from "../hooks/useEvent";
import { useTicketTypes, useOrders } from "../hooks/useTicket";

const TicketDashboard = () => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useEvents();

  // Fetch ticket types for selected event
  const { data: ticketTypes, isLoading: ticketTypesLoading } = useTicketTypes({
    event: selectedEventId || undefined,
  });

  // Fetch orders for selected event
  const { data: orders, isLoading: ordersLoading } = useOrders({
    event: selectedEventId || undefined,
  });

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventId = parseInt(e.target.value);
    setSelectedEventId(eventId);
  };

  const selectedEvent = events?.find((e) => e.id === selectedEventId);

  // Calculate statistics from actual data
  const calculateStats = () => {
    if (!orders || !ticketTypes) {
      return {
        total_revenue: 0,
        total_tickets_sold: 0,
        total_orders: 0,
        average_order_value: 0,
        conversion_rate: 67.5,
      };
    }

    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount.toString()),
      0,
    );
    const totalTickets = ticketTypes.reduce(
      (sum, ticket) => sum + ticket.quantity_sold,
      0,
    );
    const avgOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return {
      total_revenue: totalRevenue,
      total_tickets_sold: totalTickets,
      total_orders: orders.length,
      average_order_value: avgOrderValue,
      conversion_rate: 67.5, // This would need additional tracking
    };
  };

  const stats = calculateStats();

  // Calculate event statistics
  const calculateEventStats = () => {
    if (!orders || !ticketTypes) {
      return {
        ticket_types: [],
        orders: {
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        },
        revenue: {
          total: 0,
          discounts_given: 0,
          net_revenue: 0,
        },
      };
    }

    const completedOrders = orders.filter((o) => o.status === "completed");
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");

    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount.toString()),
      0,
    );
    const discountsGiven = completedOrders.reduce(
      (sum, order) => sum + parseFloat(order.discount_amount.toString()),
      0,
    );

    const ticketTypeStats = ticketTypes.map((ticket) => ({
      name: ticket.name,
      category: ticket.category,
      quantity_sold: ticket.quantity_sold,
      quantity_available: ticket.quantity_available,
      revenue: ticket.quantity_sold * parseFloat(ticket.price.toString()),
    }));

    return {
      ticket_types: ticketTypeStats,
      orders: {
        total: orders.length,
        completed: completedOrders.length,
        pending: pendingOrders.length,
        cancelled: cancelledOrders.length,
      },
      revenue: {
        total: totalRevenue,
        discounts_given: discountsGiven,
        net_revenue: totalRevenue - discountsGiven,
      },
    };
  };

  const eventStats = calculateEventStats();

  // Get recent orders (last 5)
  const recentOrders =
    orders?.slice(0, 5).map((order) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      total_amount: parseFloat(order.total_amount.toString()),
      status: order.status,
      created_at: new Date(order.created_at).toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        month: "short",
        day: "numeric",
      }),
    })) || [];

  const statsCards = [
    {
      id: 1,
      title: "Total Revenue",
      value: `$${stats.total_revenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      bgColor: "bg-green-900/20",
    },
    {
      id: 2,
      title: "Tickets Sold",
      value: stats.total_tickets_sold.toLocaleString(),
      change: "+12.8%",
      trend: "up",
      icon: Ticket,
      bgColor: "bg-primary-900/20",
    },
    {
      id: 3,
      title: "Total Orders",
      value: stats.total_orders.toString(),
      change: "+8.4%",
      trend: "up",
      icon: ShoppingCart,
      bgColor: "bg-primary-900/20",
    },
    {
      id: 4,
      title: "Avg Order Value",
      value: `$${stats.average_order_value.toFixed(2)}`,
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      bgColor: "bg-primary-900/20",
    },
  ];

  const maxTicketsSold = Math.max(
    ...eventStats.ticket_types.map((t) => t.quantity_sold),
    1,
  );

  // Loading state
  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  // No events state
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Ticket className="w-16 h-16 text-primary-600" />
        <h3 className="text-xl font-semibold text-light">No Events Found</h3>
        <p className="text-primary-400">
          Create an event first to manage tickets
        </p>
        <Link to="/events/create">
          <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all">
            Create Event
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Ticket Dashboard
          </h1>
          <p className="text-primary-300">
            Track your ticket sales and revenue performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
          <Link to="/ticket/create">
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2">
              <Ticket size={18} />
              Create Ticket Type
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
        {/* Ticket Sales by Type */}
        <div className="lg:col-span-2" data-aos="fade-up">
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-xl font-bold text-light mb-1">
                  {selectedEvent
                    ? `${selectedEvent.title} - Ticket Sales`
                    : "Ticket Sales by Type"}
                </h3>
                <p className="text-sm text-primary-400">
                  Sales breakdown by ticket category
                </p>
              </div>
              {events && events.length > 0 && (
                <select
                  className="px-3 py-2 bg-dark border border-primary-800 text-primary-300 rounded-lg text-sm focus:outline-none focus:border-primary-600"
                  value={selectedEventId || ""}
                  onChange={handleEventChange}
                >
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {ticketTypesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
              </div>
            ) : (
              <>
                {/* Revenue Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-900/20 rounded-lg p-4">
                    <p className="text-xs text-green-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-light">
                      $
                      {eventStats.revenue.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-xs text-yellow-400 mb-1">
                      Discounts Given
                    </p>
                    <p className="text-2xl font-bold text-light">
                      $
                      {eventStats.revenue.discounts_given.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>
                  <div className="bg-blue-900/20 rounded-lg p-4">
                    <p className="text-xs text-blue-400 mb-1">Net Revenue</p>
                    <p className="text-2xl font-bold text-light">
                      $
                      {eventStats.revenue.net_revenue.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Ticket Type Sales Chart */}
                {eventStats.ticket_types.length > 0 ? (
                  <div className="space-y-4">
                    {eventStats.ticket_types.map((ticket, index) => {
                      const soldPercentage =
                        (ticket.quantity_sold / ticket.quantity_available) *
                        100;
                      const chartWidth =
                        (ticket.quantity_sold / maxTicketsSold) * 100;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-light">
                                {ticket.name}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  ticket.category === "vip"
                                    ? "bg-purple-900/30 text-purple-400"
                                    : ticket.category === "premium"
                                      ? "bg-blue-900/30 text-blue-400"
                                      : ticket.category === "early_bird"
                                        ? "bg-yellow-900/30 text-yellow-400"
                                        : "bg-primary-900/30 text-primary-400"
                                }`}
                              >
                                {ticket.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-primary-400">
                                {ticket.quantity_sold} /{" "}
                                {ticket.quantity_available}
                              </span>
                              <span className="text-green-400 font-medium">
                                $
                                {ticket.revenue.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-8 bg-primary-900/30 rounded-lg overflow-hidden relative">
                              <div
                                className="h-full bg-linear-to-r from-primary-600 to-primary-700 rounded-lg transition-all duration-1000"
                                style={{ width: `${chartWidth}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-primary-300 w-12 text-right">
                              {soldPercentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <p className="text-primary-400">
                      No ticket types created yet
                    </p>
                    <Link to="/ticket/create">
                      <button className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all">
                        Create Ticket Type
                      </button>
                    </Link>
                  </div>
                )}

                {/* Order Statistics */}
                <div className="mt-6 pt-6 border-t border-primary-800">
                  <h4 className="text-sm font-semibold text-primary-300 mb-3">
                    Order Statistics
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-light">
                        {eventStats.orders.total}
                      </p>
                      <p className="text-xs text-primary-400 mt-1">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {eventStats.orders.completed}
                      </p>
                      <p className="text-xs text-primary-400 mt-1">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {eventStats.orders.pending}
                      </p>
                      <p className="text-xs text-primary-400 mt-1">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">
                        {eventStats.orders.cancelled}
                      </p>
                      <p className="text-xs text-primary-400 mt-1">Cancelled</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div data-aos="fade-up" data-aos-delay="100">
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-light">
                Recent Orders
              </h3>
              <Link
                to="/ticket/orders"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                View All
              </Link>
            </div>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-primary-900/20 rounded-lg hover:bg-primary-900/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-light">
                          {order.order_number}
                        </p>
                        <p className="text-xs text-primary-400">
                          {order.customer_name}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "completed"
                            ? "bg-green-900/30 text-green-400"
                            : order.status === "pending"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary-500">
                        {order.created_at}
                      </span>
                      <span className="text-sm font-bold text-green-400">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <p className="text-primary-400">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Selling Tickets */}
      <div data-aos="fade-up">
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
          <h3 className="font-heading text-xl font-bold text-light mb-4">
            Top Selling Ticket Types
          </h3>
          {ticketTypesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
          ) : eventStats.ticket_types.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {eventStats.ticket_types
                .sort((a, b) => b.revenue - a.revenue)
                .map((ticket, index) => (
                  <div
                    key={index}
                    className="p-4 border border-primary-800 rounded-lg hover:border-primary-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Package size={20} className="text-primary-400" />
                      <span className="text-xs font-bold text-primary-500">
                        #{index + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-light mb-1">
                      {ticket.name}
                    </h4>
                    <p className="text-xs text-primary-400 mb-3">
                      {ticket.quantity_sold} sold of {ticket.quantity_available}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary-500">Revenue</span>
                      <span className="text-lg font-bold text-green-400">
                        $
                        {ticket.revenue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-primary-600 mx-auto mb-3" />
              <p className="text-primary-400">No ticket sales data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDashboard;
