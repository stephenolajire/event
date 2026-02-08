import { useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { usePatchGuest, useGuest } from "../../hooks/useGuest";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { InferType } from "yup";

interface EditGuestModalProps {
  guestId: number;
  isOpen: boolean;
  onClose: () => void;
}

const guestSchema = yup.object({
  first_name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email address"),
  phone_number: yup.string().default(""),
  company: yup.string().default(""),
  title: yup.string().default(""),
  notes: yup.string().default(""),
  status: yup
    .mixed<"pending" | "confirmed" | "declined">()
    .oneOf(["pending", "confirmed", "declined"])
    .required("Status is required"),
  plus_one_allowed: yup.boolean().default(false),
  plus_one_name: yup.string().default(""),
});

type GuestFormData = InferType<typeof guestSchema>;

const EditGuestModal = ({ guestId, isOpen, onClose }: EditGuestModalProps) => {
  const { data: guest, isLoading: isLoadingGuest } = useGuest(guestId);
  const { mutate: patchGuest, isPending } = usePatchGuest(guestId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GuestFormData>({
    resolver: yupResolver(guestSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      company: "",
      title: "",
      notes: "",
      status: "pending",
      plus_one_allowed: false,
      plus_one_name: "",
    },
  });

  const plusOneAllowed = watch("plus_one_allowed");

  useEffect(() => {
    if (isOpen && guest) {
      reset({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone_number: guest.phone_number || "",
        company: guest.company || "",
        title: guest.title || "",
        notes: guest.notes || "",
        status: guest.status,
        plus_one_allowed: guest.plus_one_allowed,
        plus_one_name: guest.plus_one_name || "",
      });
    }
  }, [guest, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: GuestFormData) => {
    patchGuest(data, {
      onSuccess: () => {
        toast.success("Guest updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        onClose();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to update guest",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "dark",
          },
        );
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="bg-dark-light border border-primary-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        data-aos="zoom-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-light border-b border-primary-900 p-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-light">
            Edit Guest
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-900/30 rounded-lg transition-colors"
          >
            <X size={24} className="text-primary-400" />
          </button>
        </div>

        {/* Form */}
        {isLoadingGuest ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-primary-400">Loading guest details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register("first_name")}
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.first_name
                      ? "border-red-500 focus:border-red-500"
                      : "border-primary-800 focus:border-primary-600"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register("last_name")}
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.last_name
                      ? "border-red-500 focus:border-red-500"
                      : "border-primary-800 focus:border-primary-600"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full px-4 py-3 bg-dark border ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-800 focus:border-primary-600"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                placeholder="guest@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                {...register("phone_number")}
                className={`w-full px-4 py-3 bg-dark border ${
                  errors.phone_number
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-800 focus:border-primary-600"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Company & Title */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  {...register("company")}
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.company
                      ? "border-red-500 focus:border-red-500"
                      : "border-primary-800 focus:border-primary-600"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                  placeholder="Company name"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.company.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.title
                      ? "border-red-500 focus:border-red-500"
                      : "border-primary-800 focus:border-primary-600"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                  placeholder="Job title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Status *
              </label>
              <select
                {...register("status")}
                className={`w-full px-4 py-3 bg-dark border ${
                  errors.status
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-800 focus:border-primary-600"
                } rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.status.message}
                </p>
              )}
            </div>

            {/* Plus One */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("plus_one_allowed")}
                  className="w-4 h-4 bg-dark border-primary-800 rounded text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                />
                <span className="text-sm text-primary-300">Allow plus one</span>
              </label>
            </div>

            {plusOneAllowed && (
              <div>
                <label className="block text-sm font-medium text-primary-300 mb-2">
                  Plus One Name
                </label>
                <input
                  type="text"
                  {...register("plus_one_name")}
                  className={`w-full px-4 py-3 bg-dark border ${
                    errors.plus_one_name
                      ? "border-red-500 focus:border-red-500"
                      : "border-primary-800 focus:border-primary-600"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                  placeholder="Plus one name"
                />
                {errors.plus_one_name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.plus_one_name.message}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className={`w-full px-4 py-3 bg-dark border ${
                  errors.notes
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-800 focus:border-primary-600"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all resize-none`}
                placeholder="Additional notes..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.notes.message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-primary-900">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-light rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditGuestModal;
