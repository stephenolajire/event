import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Calendar,
  MapPin,
  Building,
  Users,
  Clock,
  ArrowLeft,
  Save,
  FileText,
  Settings,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import AOS from "aos";
import { useCreateEvent } from "../hooks/useEvent";
import { toast } from "react-toastify";

// Validation Schema - Updated to include all fields
const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required("Event title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  event_date: yup
    .string()
    .required("Event date is required")
    .test("is-future", "Event date must be in the future", (value) => {
      return value ? new Date(value) > new Date() : false;
    }),
  event_end_date: yup
    .string()
    .required("Event end date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { event_date } = this.parent;
        return value && event_date
          ? new Date(value) >= new Date(event_date)
          : false;
      },
    ),
  location: yup.string().required("Location is required"),
  venue_name: yup.string().required("Venue name is required"),
  address: yup.string().required("Address is required"),
  capacity: yup
    .number()
    .required("Capacity is required")
    .min(1, "Capacity must be at least 1")
    .max(1000000, "Capacity is too large")
    .typeError("Capacity must be a number"),
  allow_plus_one: yup.boolean().default(false),
  require_rsvp: yup.boolean().default(true),
  enable_self_checkin: yup.boolean().default(true),
  is_public: yup.boolean().default(true),
  status: yup
    .mixed<"draft" | "published">()
    .oneOf(["draft", "published"])
    .default("draft"),
  checkin_start_time: yup.string().optional(),
  checkin_end_time: yup
    .string()
    .optional()
    .test(
      "is-after-checkin-start",
      "Check-in end time must be after start time",
      function (value) {
        const { checkin_start_time } = this.parent;
        if (!value || !checkin_start_time) return true;
        return new Date(value) > new Date(checkin_start_time);
      },
    ),
});

interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_end_date: string;
  location: string;
  venue_name: string;
  address: string;
  capacity: number;
  allow_plus_one: boolean;
  require_rsvp: boolean;
  enable_self_checkin: boolean;
  checkin_start_time?: string;
  checkin_end_time?: string;
  is_public: boolean;
  status: "draft" | "published";
}

const CreateEvent = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "settings">("basic");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const { mutate: createEvent, isPending } = useCreateEvent();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      allow_plus_one: false,
      require_rsvp: true,
      enable_self_checkin: true,
      is_public: true,
      status: "draft",
    },
  });

  const watchEnableSelfCheckin = watch("enable_self_checkin");

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerPreview(null);
    setBannerFile(null);
  };

  const onSubmit = (data: EventFormData) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("event_date", data.event_date);
    formData.append("event_end_date", data.event_end_date);
    formData.append("location", data.location);
    formData.append("venue_name", data.venue_name);
    formData.append("address", data.address);
    formData.append("capacity", data.capacity.toString());
    formData.append("allow_plus_one", data.allow_plus_one.toString());
    formData.append("require_rsvp", data.require_rsvp.toString());
    formData.append("enable_self_checkin", data.enable_self_checkin.toString());
    formData.append("is_public", data.is_public.toString());
    formData.append("status", data.status);

    if (data.checkin_start_time) {
      formData.append("checkin_start_time", data.checkin_start_time);
    }
    if (data.checkin_end_time) {
      formData.append("checkin_end_time", data.checkin_end_time);
    }

    if (bannerFile) {
      formData.append("banner_image", bannerFile);
    }

    createEvent(formData as any, {
      onSuccess: () => {
        toast.success(
          data.status === "published"
            ? "Event created and published successfully!"
            : "Event saved as draft!",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
          },
        );
        navigate(`/dashboard/events`);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data?.title?.[0] ||
          error?.response?.data?.event_date?.[0] ||
          "Failed to create event. Please try again.";

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
      },
    });
  };

  const handleSaveAsDraft = () => {
    setValue("status", "draft");
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue("status", "published");
    handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light mb-2">
            Create New Event
          </h1>
          <p className="text-sm sm:text-base text-primary-300">
            Fill in the details to create your event
          </p>
        </div>
        <Link
          to="/dashboard/events"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 text-sm w-fit"
        >
          <ArrowLeft size={18} />
          Back to Events
        </Link>
      </div>

      {/* Tabs */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl overflow-hidden"
        data-aos="fade-up"
      >
        <div className="flex border-b border-primary-900">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === "basic"
                ? "bg-primary-600 text-light"
                : "text-primary-300 hover:bg-primary-900/30"
            }`}
          >
            <FileText size={20} />
            <span className="hidden sm:inline">Basic Information</span>
            <span className="sm:hidden">Basic</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              activeTab === "settings"
                ? "bg-primary-600 text-light"
                : "text-primary-300 hover:bg-primary-900/30"
            }`}
          >
            <Settings size={20} />
            <span className="hidden sm:inline">Event Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>

        <form className="p-6 sm:p-8">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              {/* Event Title */}
              <div className="w-full">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-primary-300 mb-2"
                >
                  Event Title *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                    <Calendar size={20} />
                  </div>
                  <input
                    type="text"
                    id="title"
                    placeholder="Enter event title"
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

              {/* Description */}
              <div className="w-full">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-primary-300 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Enter event description"
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all resize-none`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="w-full">
                  <label
                    htmlFor="event_date"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Start Date & Time *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Calendar size={20} />
                    </div>
                    <input
                      type="datetime-local"
                      id="event_date"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.event_date
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light focus:outline-none focus:ring-2 transition-all`}
                      {...register("event_date")}
                    />
                  </div>
                  {errors.event_date && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.event_date.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="event_end_date"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    End Date & Time *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Calendar size={20} />
                    </div>
                    <input
                      type="datetime-local"
                      id="event_end_date"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.event_end_date
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light focus:outline-none focus:ring-2 transition-all`}
                      {...register("event_end_date")}
                    />
                  </div>
                  {errors.event_end_date && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.event_end_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="w-full">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    City/Location *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <MapPin size={20} />
                    </div>
                    <input
                      type="text"
                      id="location"
                      placeholder="e.g., New York, NY"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.location
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                      {...register("location")}
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="venue_name"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Venue Name *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Building size={20} />
                    </div>
                    <input
                      type="text"
                      id="venue_name"
                      placeholder="e.g., Grand Hotel"
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.venue_name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                      {...register("venue_name")}
                    />
                  </div>
                  {errors.venue_name && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.venue_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="w-full">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-primary-300 mb-2"
                >
                  Full Address *
                </label>
                <input
                  type="text"
                  id="address"
                  placeholder="Enter complete address"
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.address
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Capacity */}
              <div className="w-full">
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-primary-300 mb-2"
                >
                  Event Capacity *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                    <Users size={20} />
                  </div>
                  <input
                    type="number"
                    id="capacity"
                    placeholder="Maximum number of guests"
                    className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                      errors.capacity
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                    } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                    {...register("capacity")}
                  />
                </div>
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              {/* Banner Image */}
              <div className="w-full">
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Event Banner (Optional)
                </label>
                {bannerPreview ? (
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg border border-primary-800"
                    />
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    >
                      <X size={16} className="text-light" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="banner_image"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary-800 rounded-lg cursor-pointer hover:border-primary-600 transition-all bg-primary-900/10"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      <Upload size={40} className="text-primary-500 mb-3" />
                      <p className="mb-2 text-sm text-primary-300">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-primary-500">
                        PNG, JPG or WEBP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      id="banner_image"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Event Options */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-light">
                  Event Options
                </h3>

                {/* Allow Plus One */}
                <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
                  <div>
                    <p className="font-medium text-light mb-1">
                      Allow Plus One
                    </p>
                    <p className="text-sm text-primary-400">
                      Guests can bring a +1 to the event
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("allow_plus_one")}
                    />
                    <div className="w-11 h-6 bg-primary-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Require RSVP */}
                <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
                  <div>
                    <p className="font-medium text-light mb-1">Require RSVP</p>
                    <p className="text-sm text-primary-400">
                      Guests must confirm attendance
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("require_rsvp")}
                    />
                    <div className="w-11 h-6 bg-primary-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Enable Self Check-in */}
                <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
                  <div>
                    <p className="font-medium text-light mb-1">
                      Enable Self Check-in
                    </p>
                    <p className="text-sm text-primary-400">
                      Guests can check themselves in
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("enable_self_checkin")}
                    />
                    <div className="w-11 h-6 bg-primary-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Public Event */}
                <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
                  <div>
                    <p className="font-medium text-light mb-1">Public Event</p>
                    <p className="text-sm text-primary-400">
                      Event visible to everyone
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      {...register("is_public")}
                    />
                    <div className="w-11 h-6 bg-primary-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>

              {/* Check-in Time Window */}
              {watchEnableSelfCheckin && (
                <div className="space-y-4">
                  <h3 className="font-heading text-lg font-bold text-light">
                    Check-in Time Window (Optional)
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="w-full">
                      <label
                        htmlFor="checkin_start_time"
                        className="block text-sm font-medium text-primary-300 mb-2"
                      >
                        Check-in Start Time
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                          <Clock size={20} />
                        </div>
                        <input
                          type="datetime-local"
                          id="checkin_start_time"
                          className="w-full pl-12 pr-4 py-3 bg-dark border border-primary-800 focus:border-primary-600 focus:ring-primary-600/20 rounded-lg text-light focus:outline-none focus:ring-2 transition-all"
                          {...register("checkin_start_time")}
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label
                        htmlFor="checkin_end_time"
                        className="block text-sm font-medium text-primary-300 mb-2"
                      >
                        Check-in End Time
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                          <Clock size={20} />
                        </div>
                        <input
                          type="datetime-local"
                          id="checkin_end_time"
                          className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                            errors.checkin_end_time
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                              : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                          } rounded-lg text-light focus:outline-none focus:ring-2 transition-all`}
                          {...register("checkin_end_time")}
                        />
                      </div>
                      {errors.checkin_end_time && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.checkin_end_time.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-dark/95 backdrop-blur-sm p-4 border-t border-primary-900 rounded-t-xl"
        data-aos="fade-up"
      >
        <button
          type="button"
          onClick={handleSaveAsDraft}
          disabled={isPending}
          className="flex-1 px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save as Draft
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-light rounded-lg font-semibold transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-light border-t-transparent rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Publish Event
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;
