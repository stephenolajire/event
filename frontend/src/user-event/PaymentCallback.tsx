import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import ticketService from "../services/ticketService";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        setMessage("Payment reference not found");
        return;
      }

      try {
        const result = await ticketService.verifyPayment(reference);

        if (result.status === "success") {
          setStatus("success");
          setMessage("Payment successful! Redirecting...");

          // Clear cart and session
          sessionStorage.removeItem("cart");
          sessionStorage.removeItem("eventId");
          sessionStorage.removeItem("orderReference");

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate("/payment-success");
          }, 2000);
        } else {
          setStatus("failed");
          setMessage("Payment verification failed");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setMessage(error.response?.data?.message || "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-light mb-2">
              Processing Payment
            </h2>
            <p className="text-primary-300">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-green-600 rounded-full blur-2xl opacity-50 animate-pulse" />
              <CheckCircle className="relative w-16 h-16 text-green-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-light mb-2">
              Payment Successful!
            </h2>
            <p className="text-primary-300">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-light mb-2">
              Payment Failed
            </h2>
            <p className="text-primary-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/checkout")}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
