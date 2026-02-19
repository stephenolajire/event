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
import { toast } from "react-toastify";

declare const PaystackPop: any;

interface CartItem {
  ticket_type_id: number;
  name: string;
  price: number;
  quantity: number;
}

const NGN_RATE = 1600;

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
    AOS.init({ duration: 600, once: true });
    const savedCart = sessionStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate("/event");
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    const eventId = parseInt(sessionStorage.getItem("eventId") || "0");
    setIsValidatingDiscount(true);
    try {
      const result = await ticketService.validateDiscountCode({
        code: discountCode,
        event_id: eventId,
        order_total: getSubtotal(),
      });
      if (result.valid) {
        setAppliedDiscount({
          code: discountCode,
          amount: result.discount_amount,
        });
        toast.success("Discount code applied!");
      } else {
        toast.error("Invalid discount code");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Invalid or expired discount code",
      );
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const getSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getTotal = () => getSubtotal() - (appliedDiscount?.amount || 0);

  const toNGN = (usd: number) => `₦${(usd * NGN_RATE).toLocaleString()}`;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
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
      const paymentData = await ticketService.initializePayment(order.id);

      if (!paymentData.status || !paymentData.access_code) {
        throw new Error("Failed to initialize payment");
      }

      sessionStorage.setItem("orderReference", order.order_number);

      const popup = new PaystackPop();
      popup.resumeTransaction(paymentData.access_code, {
        onSuccess: (transaction: { reference: string }) => {
          navigate(`/payment/callback?reference=${transaction.reference}`);
        },
        onCancel: () => {
          toast.error("Payment cancelled");
          setIsProcessing(false);
        },
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/events/${sessionStorage.getItem("eventId")}`}
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-3 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Event
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light">
            Checkout
          </h1>
        </div>

        {/* Order Summary — Mobile only, shown at top */}
        <div className="lg:hidden mb-5" data-aos="fade-up">
          <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
            <h3 className="font-heading text-base font-bold text-light mb-3 flex items-center gap-2">
              <ShoppingCart size={18} />
              Order Summary
            </h3>
            <div className="space-y-2 mb-3">
              {cart.map((item) => (
                <div
                  key={item.ticket_type_id}
                  className="flex justify-between items-center py-2 border-b border-primary-900 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-primary-400">
                      {toNGN(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-light shrink-0">
                    {toNGN(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-sm text-primary-300">
                <span>Subtotal</span>
                <span>{toNGN(getSubtotal())}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount</span>
                  <span>-{toNGN(appliedDiscount.amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-light pt-2 border-t border-primary-800">
                <span>Total</span>
                <span>{toNGN(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Information */}
            <div
              data-aos="fade-up"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4 sm:p-6"
            >
              <h2 className="font-heading text-lg sm:text-xl font-bold text-light mb-4 flex items-center gap-2">
                <User className="text-primary-400 shrink-0" size={20} />
                Customer Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-dark border ${
                      errors.name ? "border-red-600" : "border-primary-800"
                    } text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600 text-sm`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 shrink-0"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className={`w-full pl-9 pr-4 py-3 bg-dark border ${
                        errors.email ? "border-red-600" : "border-primary-800"
                      } text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600 text-sm`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-primary-500 mt-1">
                    Tickets will be sent to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-300 mb-1.5">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 shrink-0"
                      size={16}
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+234 800 000 0000"
                      className={`w-full pl-9 pr-4 py-3 bg-dark border ${
                        errors.phone ? "border-red-600" : "border-primary-800"
                      } text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600 text-sm`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Discount Code */}
            <div
              data-aos="fade-up"
              data-aos-delay="100"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4 sm:p-6"
            >
              <h2 className="font-heading text-lg sm:text-xl font-bold text-light mb-4 flex items-center gap-2">
                <Tag className="text-primary-400 shrink-0" size={20} />
                Discount Code
              </h2>

              {appliedDiscount ? (
                <div className="p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <Check
                      className="text-green-400 shrink-0 mt-0.5"
                      size={16}
                    />
                    <div className="min-w-0">
                      <p className="text-light font-medium text-sm truncate">
                        Code "{appliedDiscount.code}" applied
                      </p>
                      <p className="text-xs text-green-400">
                        You saved {toNGN(appliedDiscount.amount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedDiscount(null);
                      setDiscountCode("");
                    }}
                    className="text-xs text-primary-400 hover:text-primary-300 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) =>
                      setDiscountCode(e.target.value.toUpperCase())
                    }
                    placeholder="Enter discount code"
                    className="flex-1 min-w-0 px-3 py-3 bg-dark border border-primary-800 text-light rounded-lg focus:outline-none focus:border-primary-600 transition-colors placeholder:text-primary-600 text-sm"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={!discountCode.trim() || isValidatingDiscount}
                    className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shrink-0"
                  >
                    {isValidatingDiscount ? (
                      <Loader2 size={16} className="animate-spin" />
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
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4 sm:p-6"
            >
              <h2 className="font-heading text-lg sm:text-xl font-bold text-light mb-4 flex items-center gap-2">
                <CreditCard className="text-primary-400 shrink-0" size={20} />
                Payment Method
              </h2>
              <div className="p-3 bg-primary-900/20 border border-primary-800 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock className="text-primary-400 shrink-0" size={15} />
                  <p className="text-light font-medium text-sm">
                    Secure Payment via Paystack
                  </p>
                </div>
                <p className="text-xs text-primary-400 leading-relaxed">
                  A secure payment popup will appear to complete your purchase.
                  We accept cards, bank transfers, and USSD.
                </p>
              </div>
            </div>

            {/* Mobile Pay Button */}
            <div className="lg:hidden pb-4">
              <button
                onClick={() => handleSubmit()}
                disabled={isProcessing}
                className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-light rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Pay {toNGN(getTotal())}
                  </>
                )}
              </button>
              <p className="text-xs text-center text-primary-500 mt-3">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </div>

          {/* Right: Sidebar — Desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div
              data-aos="fade-up"
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 sticky top-6"
            >
              <h3 className="font-heading text-xl font-bold text-light mb-4 flex items-center gap-2">
                <ShoppingCart size={22} />
                Order Summary
              </h3>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.ticket_type_id}
                    className="p-3 bg-primary-900/20 rounded-lg"
                  >
                    <div className="flex justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-light truncate">
                        {item.name}
                      </p>
                      <p className="text-sm font-bold text-light shrink-0">
                        {toNGN(item.price * item.quantity)}
                      </p>
                    </div>
                    <p className="text-xs text-primary-400">
                      {toNGN(item.price)} × {item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary-800 pt-4 space-y-2">
                <div className="flex justify-between text-primary-300 text-sm">
                  <span>Subtotal</span>
                  <span>{toNGN(getSubtotal())}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>Discount</span>
                    <span>-{toNGN(appliedDiscount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-light pt-2 border-t border-primary-800">
                  <span>Total</span>
                  <span>{toNGN(getTotal())}</span>
                </div>
              </div>

              <button
                onClick={() => handleSubmit()}
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
                    <Lock size={18} />
                    Pay {toNGN(getTotal())}
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
