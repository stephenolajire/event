import {
  X,
  Mail,
  Phone,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from "lucide-react";
import { useGuest } from "../../hooks/useGuest";
import { useQRCodeByGuest } from "../../hooks/useQRCode";
import { useSendInvite } from "../../hooks/useNotifications";
import { toast } from "react-toastify";

interface ViewGuestModalProps {
  guestId: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const ViewGuestModal = ({
  guestId,
  isOpen,
  onClose,
  onEdit,
}: ViewGuestModalProps) => {
  const { data: guest, isLoading } = useGuest(guestId);
  const { data: qrCode, isLoading: isLoadingQR } = useQRCodeByGuest(guestId);
  const { mutate: sendInvite, isPending: isSendingInvite } = useSendInvite();

  if (!isOpen) return null;

  const handleSendInvite = () => {
    sendInvite(
      { guest_id: guestId },
      {
        onSuccess: (data) => {
          toast.success(data.message, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
          });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to send invitation",
            {
              position: "top-right",
              autoClose: 5000,
              theme: "dark",
            },
          );
        },
      },
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900/30 text-green-400 border-green-800";
      case "pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800";
      case "declined":
        return "bg-red-900/30 text-red-400 border-red-800";
      default:
        return "bg-primary-900/30 text-primary-400 border-primary-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-dark-light border border-primary-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        data-aos="zoom-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-light border-b border-primary-900 p-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-light">
            Guest Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-900/30 rounded-lg transition-colors"
          >
            <X size={24} className="text-primary-400" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-primary-400">Loading guest details...</p>
          </div>
        ) : guest ? (
          <div className="p-6 space-y-6">
            {/* Guest Info Header */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-bold text-light text-2xl shrink-0">
                {guest.first_name[0]}
                {guest.last_name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-2xl font-bold text-light mb-2">
                  {guest.full_name}
                </h3>
                <span
                  className={`inline-block px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}
                >
                  {guest.status}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-dark border border-primary-900 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-semibold text-primary-300 mb-3">
                Contact Information
              </h4>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-primary-500" />
                <div>
                  <p className="text-xs text-primary-400">Email</p>
                  <p className="text-sm text-light">{guest.email}</p>
                </div>
              </div>
              {guest.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary-500" />
                  <div>
                    <p className="text-xs text-primary-400">Phone</p>
                    <p className="text-sm text-light">{guest.phone_number}</p>
                  </div>
                </div>
              )}
              {guest.company && (
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-primary-500" />
                  <div>
                    <p className="text-xs text-primary-400">Company</p>
                    <p className="text-sm text-light">{guest.company}</p>
                  </div>
                </div>
              )}
              {guest.title && (
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-primary-500" />
                  <div>
                    <p className="text-xs text-primary-400">Title</p>
                    <p className="text-sm text-light">{guest.title}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark border border-primary-900 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-300 mb-3">
                  RSVP Status
                </h4>
                <div className="flex items-center gap-2">
                  {guest.rsvp_status ? (
                    <>
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm text-light">Confirmed</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} className="text-red-400" />
                      <span className="text-sm text-light">Not Confirmed</span>
                    </>
                  )}
                </div>
                {guest.rsvp_date && (
                  <p className="text-xs text-primary-400 mt-2">
                    {new Date(guest.rsvp_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="bg-dark border border-primary-900 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-300 mb-3">
                  Check-in Status
                </h4>
                <div className="flex items-center gap-2">
                  {guest.has_checked_in ? (
                    <>
                      <CheckCircle size={20} className="text-blue-400" />
                      <span className="text-sm text-light">Checked In</span>
                    </>
                  ) : (
                    <>
                      <Clock size={20} className="text-primary-500" />
                      <span className="text-sm text-light">Not Checked In</span>
                    </>
                  )}
                </div>
                {guest.checked_in_at && (
                  <p className="text-xs text-primary-400 mt-2">
                    {new Date(guest.checked_in_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Invitation Status */}
            <div className="bg-dark border border-primary-900 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-primary-300 mb-3">
                Invitation
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  {guest.invitation_sent ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-sm text-light">
                          Invitation Sent
                        </span>
                      </div>
                      {guest.invitation_sent_at && (
                        <p className="text-xs text-primary-400">
                          {new Date(guest.invitation_sent_at).toLocaleString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-yellow-400" />
                      <span className="text-sm text-light">Not Sent</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-light rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSendingInvite ? (
                    <>
                      <div className="w-4 h-4 border-2 border-light border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {guest.invitation_sent ? "Resend" : "Send"} Invite
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="bg-dark border border-primary-900 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-300 mb-3">
                  QR Code
                </h4>
                <div className="flex flex-col items-center gap-4">
                  {isLoadingQR ? (
                    <div className="w-48 h-48 bg-dark-light rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={qrCode.qr_image}
                        alt="Guest QR Code"
                        className="w-48 h-48 border border-primary-800 rounded-lg"
                      />
                      <div className="text-center">
                        <p className="text-xs text-primary-400 mb-1">Token</p>
                        <code className="text-sm text-light bg-dark px-3 py-1 rounded">
                          {qrCode.token}
                        </code>
                      </div>
                      {qrCode.is_used && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <CheckCircle size={16} />
                          <span>QR Code Used</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {guest.notes && (
              <div className="bg-dark border border-primary-900 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-300 mb-2">
                  Notes
                </h4>
                <p className="text-sm text-primary-200">{guest.notes}</p>
              </div>
            )}

            {/* Plus One */}
            {guest.plus_one_allowed && (
              <div className="bg-dark border border-primary-900 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-primary-300 mb-2">
                  Plus One
                </h4>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-light">Plus one allowed</span>
                </div>
                {guest.plus_one_name && (
                  <p className="text-sm text-primary-300 mt-2">
                    Name: {guest.plus_one_name}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-primary-400">Guest not found</p>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-light border-t border-primary-900 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all"
          >
            Edit Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewGuestModal;
