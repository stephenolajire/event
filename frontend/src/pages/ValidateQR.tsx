import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import api from "../constant/api";
import { toast } from "react-toastify";

interface GuestData {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  has_checked_in: boolean;
  checked_in_at?: string;
}

interface EventData {
  id: number;
  title: string;
  event_date: string;
  location: string;
  venue_name: string;
}

interface QRCodeData {
  is_used: boolean;
  used_at?: string;
}

interface ValidationResponse {
  valid: boolean;
  error?: string;
  event_date?: string;
  current_date?: string;
  guest?: GuestData;
  event?: EventData;
  qr_code?: QRCodeData;
}

const ValidateQR = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [validationData, setValidationData] =
    useState<ValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<{
    message: string;
    eventDate: string;
    currentDate: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      validateQRCode();
    }
  }, [token]);

  const validateQRCode = async () => {
    setIsValidating(true);
    setError(null);
    setDateError(null);

    try {
      const response = await api.post("/checkin/validate_qr/", { token });
      setValidationData(response.data);
      setIsValidating(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to validate QR code";

      // Check if it's a date mismatch error
      if (
        err?.response?.data?.event_date &&
        err?.response?.data?.current_date
      ) {
        setDateError({
          message: errorMessage,
          eventDate: err.response.data.event_date,
          currentDate: err.response.data.current_date,
        });
      } else {
        setError(errorMessage);
      }

      setIsValidating(false);
    }
  };

  const handleCheckIn = async () => {
    if (!token) return;

    setIsCheckingIn(true);

    try {
      const response = await api.post("/checkin/checkin/", { token });

      toast.success(response.data.message || "Guest checked in successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });

      // Refresh validation data
      await validateQRCode();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to check in guest";

      // Check if it's a date mismatch error
      if (
        err?.response?.data?.event_date &&
        err?.response?.data?.current_date
      ) {
        toast.error(
          `Check-in is only allowed on the event date (${new Date(
            err.response.data.event_date,
          ).toLocaleDateString()})`,
          {
            position: "top-right",
            autoClose: 5000,
            theme: "dark",
          },
        );
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2
            size={64}
            className="text-primary-600 animate-spin mx-auto mb-4"
          />
          <p className="text-primary-300 text-lg">Validating QR Code...</p>
        </div>
      </div>
    );
  }

  // Handle date mismatch error
  if (dateError) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-light border border-yellow-900 rounded-xl p-8 text-center">
          <Clock size={64} className="text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-light mb-2">Not Event Day</h1>
          <p className="text-yellow-400 mb-6">{dateError.message}</p>

          <div className="bg-dark border border-yellow-800 rounded-lg p-4 mb-6 space-y-3">
            <div>
              <p className="text-xs text-primary-400 mb-1">Current Date</p>
              <p className="text-light font-semibold">
                {formatDate(dateError.currentDate)}
              </p>
            </div>
            <div className="border-t border-primary-800 pt-3">
              <p className="text-xs text-primary-400 mb-1">Event Date</p>
              <p className="text-yellow-400 font-semibold">
                {formatDate(dateError.eventDate)}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle other errors
  if (error || !validationData?.valid) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-dark-light border border-red-900 rounded-xl p-8 text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-light mb-2">
            Invalid QR Code
          </h1>
          <p className="text-red-400 mb-6">
            {error || validationData?.error || "This QR code is not valid"}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { guest, event } = validationData;

  if (!guest || !event) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle size={64} className="text-yellow-500 mx-auto mb-4" />
          <p className="text-primary-300 text-lg">No guest data found</p>
        </div>
      </div>
    );
  }

  const alreadyCheckedIn = guest.has_checked_in;

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-dark-light border border-primary-900 rounded-xl overflow-hidden">
        {/* Header */}
        <div
          className={`p-6 text-center ${
            alreadyCheckedIn
              ? "bg-green-900/20 border-b border-green-800"
              : "bg-primary-900/20 border-b border-primary-800"
          }`}
        >
          {alreadyCheckedIn ? (
            <>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-light mb-2">
                Already Checked In
              </h1>
              <p className="text-green-400">
                This guest was checked in on{" "}
                {new Date(guest.checked_in_at!).toLocaleString()}
              </p>
            </>
          ) : (
            <>
              <User size={64} className="text-primary-600 mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-light mb-2">
                Guest Verification
              </h1>
              <p className="text-primary-300">Confirm guest details below</p>
            </>
          )}
        </div>

        {/* Event Details */}
        <div className="p-6 bg-primary-900/10 border-b border-primary-900">
          <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary-600" />
            Event Details
          </h2>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-medium min-w-25">
                Event:
              </span>
              <span className="text-light">{event.title}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-medium min-w-25">
                Date:
              </span>
              <span className="text-light">
                {new Date(event.event_date).toLocaleString()}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-medium min-w-25">
                Venue:
              </span>
              <span className="text-light">{event.venue_name}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 font-medium min-w-25">
                Location:
              </span>
              <span className="text-light">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Guest Details */}
        <div className="p-6">
          <h2 className="text-lg font-bold text-light mb-4 flex items-center gap-2">
            <User size={20} className="text-primary-600" />
            Guest Details
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-primary-800">
              <User size={20} className="text-primary-500" />
              <div>
                <p className="text-xs text-primary-400">Full Name</p>
                <p className="text-light font-medium">{guest.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-primary-800">
              <Mail size={20} className="text-primary-500" />
              <div>
                <p className="text-xs text-primary-400">Email</p>
                <p className="text-light font-medium">{guest.email}</p>
              </div>
            </div>

            {guest.phone_number && (
              <div className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-primary-800">
                <Phone size={20} className="text-primary-500" />
                <div>
                  <p className="text-xs text-primary-400">Phone</p>
                  <p className="text-light font-medium">{guest.phone_number}</p>
                </div>
              </div>
            )}

            {guest.company && (
              <div className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-primary-800">
                <Building size={20} className="text-primary-500" />
                <div>
                  <p className="text-xs text-primary-400">Company</p>
                  <p className="text-light font-medium">{guest.company}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-primary-900/10 border-t border-primary-900">
          {!alreadyCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-light rounded-lg font-bold text-lg transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
            >
              {isCheckingIn ? (
                <>
                  <div className="w-6 h-6 border-2 border-light border-t-transparent rounded-full animate-spin" />
                  Checking In...
                </>
              ) : (
                <>
                  <CheckCircle size={24} />
                  Check In Guest
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
              <p className="text-green-400 font-semibold">
                Guest Successfully Checked In
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateQR;
