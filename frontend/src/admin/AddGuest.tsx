import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  ArrowLeft,
  Save,
  UserPlus,
  Users,
  Loader2,
  Calendar,
} from "lucide-react";
import AOS from "aos";
import { useCreateGuest } from "../hooks/useGuest";
import { useEvents } from "../hooks/useEvent";
import { toast } from "react-toastify";

// Validation Schema
const guestSchema = yup.object().shape({
  event: yup
    .number()
    .required("Please select an event")
    .typeError("Please select an event"),
  first_name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must not exceed 100 characters"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must not exceed 100 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone_number: yup
    .string()
    .optional()
    .matches(/^[\d\s\-\+\(\)]*$/, "Please enter a valid phone number"),
  company: yup
    .string()
    .optional()
    .max(200, "Company name must not exceed 200 characters"),
  title: yup
    .string()
    .optional()
    .max(200, "Title must not exceed 200 characters"),
  notes: yup
    .string()
    .optional()
    .max(500, "Notes must not exceed 500 characters"),
  plus_one_allowed: yup.boolean().default(false),
  plus_one_name: yup
    .string()
    .optional()
    .max(200, "Plus one name must not exceed 200 characters"),
  status: yup
    .mixed<"pending" | "confirmed" | "declined">()
    .oneOf(["pending", "confirmed", "declined"])
    .default("pending"),
  rsvp_status: yup.boolean().default(false),
});

interface GuestFormData {
  event: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  title?: string;
  notes?: string;
  plus_one_allowed: boolean;
  plus_one_name?: string;
  status: "pending" | "confirmed" | "declined";
  rsvp_status: boolean;
}

const AddGuest = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  const { mutate: createGuest, isPending } = useCreateGuest();

  // Fetch all events
  const {
    data: eventsData,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useEvents();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Handle events fetch error
  useEffect(() => {
    if (isEventsError) {
      toast.error("Failed to load events", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }
  }, [isEventsError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GuestFormData>({
    resolver: yupResolver(guestSchema),
    defaultValues: {
      event: eventId ? parseInt(eventId) : undefined,
      plus_one_allowed: false,
      status: "pending",
      rsvp_status: false,
    },
  });

  const watchPlusOneAllowed = watch("plus_one_allowed");

  const onSubmit = (data: GuestFormData) => {
    const { event, ...guestData } = data;

    const payload = {
      ...guestData,
      event: event,
    };

    createGuest(payload, {
      onSuccess: () => {
        toast.success("Guest added successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        navigate(`/dashboard/guests`);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data?.email?.[0] ||
          error?.response?.data?.first_name?.[0] ||
          "Failed to add guest. Please try again.";

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
      },
    });
  };

  const handleSaveAsPending = () => {
    setValue("status", "pending");
    handleSubmit(onSubmit)();
  };

  const handleSaveAsConfirmed = () => {
    setValue("status", "confirmed");
    setValue("rsvp_status", true);
    handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isEventsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2
              size={48}
              className="text-primary-600 animate-spin mx-auto mb-4"
            />
            <p className="text-primary-300">Loading events...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isEventsLoading && (
        <>
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light mb-2">
                Add New Guest
              </h1>
              <p className="text-sm sm:text-base text-primary-300">
                Fill in the guest details to add them to your event
              </p>
            </div>
            <Link
              to={
                eventId
                  ? `/dashboard/events/${eventId}/guests`
                  : "/dashboard/guests"
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 text-sm w-fit"
            >
              <ArrowLeft size={18} />
              Back to Guests
            </Link>
          </div>

          {/* Form */}
          <div
            className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl overflow-hidden"
            data-aos="fade-up"
          >
            <div className="border-b border-primary-900 px-6 py-4">
              <div className="flex items-center gap-2">
                <UserPlus size={24} className="text-primary-600" />
                <h2 className="font-heading text-xl font-bold text-light">
                  Guest Information
                </h2>
              </div>
            </div>

            <form className="p-6 sm:p-8 space-y-6">
              {/* Event Selection */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-light">
                  Event Selection
                </h3>

                <div className="w-full">
                  <label
                    htmlFor="event"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Select Event *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Calendar size={20} />
                    </div>
                    <select
                      id="event"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.event
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light focus:outline-none focus:ring-2 transition-all`}
                      {...register("event", { valueAsNumber: true })}
                    >
                      <option value="">Select an event</option>
                      {eventsData?.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} -{" "}
                          {new Date(event.event_date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.event && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.event.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-light">
                  Personal Information
                </h3>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="w-full">
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-primary-300 mb-2"
                    >
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        <User size={20} />
                      </div>
                      <input
                        type="text"
                        id="first_name"
                        placeholder="Enter first name"
                        className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                          errors.first_name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                        } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                        {...register("first_name")}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="w-full">
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-primary-300 mb-2"
                    >
                      Last Name *
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        <User size={20} />
                      </div>
                      <input
                        type="text"
                        id="last_name"
                        placeholder="Enter last name"
                        className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                          errors.last_name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                        } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                        {...register("last_name")}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="w-full">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="guest@example.com"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="w-full">
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Phone size={20} />
                    </div>
                    <input
                      type="tel"
                      id="phone_number"
                      placeholder="+1 (555) 000-0000"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.phone_number
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                      {...register("phone_number")}
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.phone_number.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-light">
                  Professional Information (Optional)
                </h3>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Company */}
                  <div className="w-full">
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-primary-300 mb-2"
                    >
                      Company
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        <Building size={20} />
                      </div>
                      <input
                        type="text"
                        id="company"
                        placeholder="e.g., Acme Corporation"
                        className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                          errors.company
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                        } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                        {...register("company")}
                      />
                    </div>
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.company.message}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="w-full">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-primary-300 mb-2"
                    >
                      Job Title
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        <Briefcase size={20} />
                      </div>
                      <input
                        type="text"
                        id="title"
                        placeholder="e.g., Senior Manager"
                        className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                          errors.title
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                        } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                        {...register("title")}
                      />
                    </div>
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-light">
                  Additional Information
                </h3>

                {/* Notes */}
                <div className="w-full">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Notes (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-3 text-primary-500">
                      <FileText size={20} />
                    </div>
                    <textarea
                      id="notes"
                      rows={4}
                      placeholder="Add any special notes or dietary requirements..."
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.notes
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all resize-none`}
                      {...register("notes")}
                    />
                  </div>
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.notes.message}
                    </p>
                  )}
                </div>

                {/* Plus One Allowed */}
                <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
                  <div>
                    <p className="font-medium text-light mb-1">
                      Allow Plus One
                    </p>
                    <p className="text-sm text-primary-400">
                      Guest can bring a companion to the event
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("plus_one_allowed")}
                    />
                    <div className="w-11 h-6 bg-primary-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Plus One Name */}
                {watchPlusOneAllowed && (
                  <div className="w-full">
                    <label
                      htmlFor="plus_one_name"
                      className="block text-sm font-medium text-primary-300 mb-2"
                    >
                      Plus One Name (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                        <Users size={20} />
                      </div>
                      <input
                        type="text"
                        id="plus_one_name"
                        placeholder="Enter companion's name"
                        className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                          errors.plus_one_name
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                        } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                        {...register("plus_one_name")}
                      />
                    </div>
                    {errors.plus_one_name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.plus_one_name.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-dark/95 backdrop-blur-sm p-4 border-t border-primary-900 rounded-t-xl"
            data-aos="fade-up"
          >
            <button
              type="button"
              onClick={handleSaveAsPending}
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Add as Pending
            </button>
            <button
              type="button"
              onClick={handleSaveAsConfirmed}
              disabled={isPending}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-light rounded-lg font-semibold transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-light border-t-transparent rounded-full animate-spin" />
                  Adding Guest...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Add & Confirm Guest
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddGuest;
