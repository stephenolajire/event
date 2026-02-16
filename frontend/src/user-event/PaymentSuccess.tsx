import { useEffect } from "react";
import {
  Calendar,
  MapPin,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";

const PaymentSuccess = () => {
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });

    // Clear cart from sessionStorage
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("eventId");
  }, []);

  // Mock order data
  const order = {
    order_number: "ORD-ABC123DEF456",
    event: {
      title: "Tech Conference 2024",
      date: "2024-12-15T09:00:00Z",
      location: "Convention Center, Lagos",
    },
    customer_email: "john@example.com",
    total_amount: 350.0,
    total_tickets: 3,
    payment_reference: "PSK_abc123xyz789",
  };

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

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 pt-20">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        {/* <div data-aos="zoom-in" className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-600 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-linear-to-br from-green-600 to-green-700 rounded-full p-8">
              <CheckCircle size={64} className="text-white" />
            </div>
          </div>
        </div> */}

        {/* Success Message */}
        <div
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-center mb-8"
        >
          <h1 className="font-heading text-4xl font-bold text-light mb-3">
            Payment Successful!
          </h1>
          <p className="text-xl text-primary-300">
            Your tickets have been confirmed
          </p>
        </div>

        {/* Order Details Card */}
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-8 mb-6"
        >
          {/* Order Number */}
          <div className="text-center mb-8 pb-8 border-b border-primary-800">
            <p className="text-sm text-primary-400 mb-2">Order Number</p>
            <p className="text-2xl font-mono font-bold text-light">
              {order.order_number}
            </p>
            <p className="text-sm text-primary-500 mt-2">
              Reference: {order.payment_reference}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-8">
            <h3 className="font-heading text-lg font-bold text-light mb-4">
              Event Details
            </h3>
            <div className="flex items-start gap-3">
              <Calendar
                className="text-primary-400 shrink-0 mt-1"
                size={20}
              />
              <div>
                <p className="text-light font-medium">{order.event.title}</p>
                <p className="text-sm text-primary-400">
                  {formatDate(order.event.date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin
                className="text-primary-400 shrink-0 mt-1"
                size={20}
              />
              <p className="text-light">{order.event.location}</p>
            </div>
            <div className="flex items-start gap-3">
              <Ticket
                className="text-primary-400 shrink-0 mt-1"
                size={20}
              />
              <div>
                <p className="text-light font-medium">
                  {order.total_tickets} Ticket
                  {order.total_tickets !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-primary-400">
                  Total: ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/event"
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
