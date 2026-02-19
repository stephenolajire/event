import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  User,
  Mail,
  Phone,
  Lock,
  Tag,
  Loader2,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AOS from "aos";
import ticketService from "../services/ticketService";

interface CartItem {
  ticket_type_id: number;
  name: string;
  price: number;
  quantity: number;
}

const TicketCheckout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });

    // Load cart from sessionStorage
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // Redirect back if no cart
      navigate("/");
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsValidatingDiscount(true);
    try {
      // TODO: API call to validate discount code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock discount
      setAppliedDiscount({
        code: discountCode,
        amount: getSubtotal() * 0.1, // 10% discount
      });
    } catch (error) {
      console.error("Invalid discount code");
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = appliedDiscount?.amount || 0;
    return subtotal - discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Create order
      const orderData = {
        event: parseInt(sessionStorage.getItem("eventId") || "0"),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: cart.map((item) => ({
          ticket_type_id: item.ticket_type_id,
          quantity: item.quantity,
        })),
        discount_code: appliedDiscount?.code,
      };

      const order = await ticketService.createOrder(orderData);

      // Initialize Paystack payment
      const paymentData = await ticketService.initializePayment(order.id);

      if (paymentData.status && paymentData.authorization_url) {
        // Store order reference
        sessionStorage.setItem("orderReference", order.order_number);

        // Redirect to Paystack payment page
        window.location.href = paymentData.authorization_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/events/${sessionStorage.getItem("eventId")}`}
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Event
          </Link>
          <h1 className="font-heading text-3xl font-bold text-light">
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div
              data-aos="fade-up"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
            >
              <h2 className="font-heading text-xl font-bold text-light mb-6 flex items-center gap-2">
                <User className="text-primary-400" size={24} />
                Customer Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-dark border ${errors.name ? "border-red-600" : "border-primary-800"} text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full pl-10 pr-4 py-3 bg-dark border ${errors.email ? "border-red-600" : "border-primary-800"} text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-primary-500 mt-1">
                    Tickets will be sent to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-2">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                      size={18}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+234 800 000 0000"
                      className={`w-full pl-10 pr-4 py-3 bg-dark border ${errors.phone ? "border-red-600" : "border-primary-800"} text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Discount Code */}
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
            >
              <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
                <Tag className="text-primary-400" size={24} />
                Discount Code
              </h2>

              {appliedDiscount ? (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="text-green-400" size={20} />
                    <div>
                      <p className="text-light font-medium">
                        Code "{appliedDiscount.code}" applied
                      </p>
                      <p className="text-sm text-green-400">
                        You saved ${appliedDiscount.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedDiscount(null);
                      setDiscountCode("");
                    }}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={!discountCode.trim() || isValidatingDiscount}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidatingDiscount ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
            >
              <h2 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
                <CreditCard className="text-primary-400" size={24} />
                Payment Method
              </h2>

              <div className="p-4 bg-primary-900/20 border border-primary-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="text-primary-400" size={18} />
                  <p className="text-light font-medium">Secure Payment</p>
                </div>
                <p className="text-sm text-primary-400">
                  You will be redirected to a secure payment page to complete
                  your purchase. We accept cards and bank transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div
              data-aos="fade-up"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 sticky top-6"
            >
              <h3 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
                <ShoppingCart size={24} />
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.ticket_type_id}
                    className="p-3 bg-primary-900/20 rounded-lg"
                  >
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium text-light">
                        {item.name}
                      </p>
                      <p className="text-sm font-bold text-light">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-primary-400">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary-800 pt-4 space-y-2">
                <div className="flex justify-between text-primary-300">
                  <span>Subtotal</span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${appliedDiscount.amount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-2xl font-bold text-light pt-2 border-t border-primary-800">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full mt-6 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-bold transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pay ${getTotal().toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-primary-500 mt-4">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCheckout;
