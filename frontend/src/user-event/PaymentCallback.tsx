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
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const result = await ticketService.verifyPayment(reference);

        if (result.status === "success") {
          setStatus("success");
          setMessage(
            "Payment successful! Your tickets have been sent to your email.",
          );
          // Redirect to a success page or home after 3 seconds
          setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("failed");
          setMessage("Payment was not successful. Please try again.");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("Could not verify payment. Please contact support.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-light mb-2">
              Verifying Payment...
            </h2>
            <p className="text-primary-400">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-light mb-2">
              Payment Successful!
            </h2>
            <p className="text-primary-400">{message}</p>
            <p className="text-sm text-primary-500 mt-2">
              Redirecting you shortly...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-light mb-2">
              Payment Failed
            </h2>
            <p className="text-primary-400">{message}</p>
            <button
              onClick={() => navigate("/checkout")}
              className="mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all"
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
