import { toast, type ToastOptions } from "react-toastify";

// Default toast options
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

// Toast utility functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, autoClose: 4000, ...options });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions,
  ) => {
    return toast.promise(
      promise,
      {
        pending: messages.pending,
        success: messages.success,
        error: messages.error,
      },
      { ...defaultOptions, ...options },
    );
  },

  // Custom toast for API errors
  apiError: (error: any, defaultMessage = "An error occurred") => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      defaultMessage;

    toast.error(message, { ...defaultOptions, autoClose: 4000 });
  },
};

// Common toast messages
export const ToastMessages = {
  // Auth
  LOGIN_SUCCESS: "Login successful! Redirecting...",
  LOGOUT_SUCCESS: "Logged out successfully",
  REGISTER_SUCCESS: "Account created successfully!",

  // Profile
  PROFILE_UPDATE_SUCCESS: "Profile updated successfully",
  PASSWORD_CHANGE_SUCCESS: "Password changed successfully",

  // Events
  EVENT_CREATE_SUCCESS: "Event created successfully",
  EVENT_UPDATE_SUCCESS: "Event updated successfully",
  EVENT_DELETE_SUCCESS: "Event deleted successfully",

  // Guests
  GUEST_ADD_SUCCESS: "Guest added successfully",
  GUEST_UPDATE_SUCCESS: "Guest updated successfully",
  GUEST_DELETE_SUCCESS: "Guest removed successfully",
  GUEST_CHECKIN_SUCCESS: "Guest checked in successfully",

  // QR Codes
  QR_GENERATE_SUCCESS: "QR code generated successfully",
  QR_DOWNLOAD_SUCCESS: "QR code downloaded",

  // Invitations
  INVITATION_SENT_SUCCESS: "Invitation sent successfully",
  INVITATION_RESEND_SUCCESS: "Invitation resent successfully",

  // Generic
  COPY_SUCCESS: "Copied to clipboard",
  SAVE_SUCCESS: "Saved successfully",
  DELETE_SUCCESS: "Deleted successfully",

  // Errors
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

export default showToast;
