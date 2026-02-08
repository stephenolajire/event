import {useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { EventListItem } from "../../services/eventService";
import { usePatchEvent } from "../../hooks/useEvent";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface EditEventModalProps {
  event: EventListItem;
  isOpen: boolean;
  onClose: () => void;
}

const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required("Event title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  location: yup.string().required("Location is required"),
  venue_name: yup.string().required("Venue name is required"),
  address: yup.string().required("Address is required"),
  capacity: yup
    .number()
    .required("Capacity is required")
    .min(1, "Capacity must be at least 1"),
});

interface EventFormData {
  title: string;
  description: string;
  location: string;
  venue_name: string;
  address: string;
  capacity: number;
}

const EditEventModal = ({ event, isOpen, onClose }: EditEventModalProps) => {
  const { mutate: patchEvent, isPending } = usePatchEvent(event.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      title: event.title,
      description: "",
      location: event.location,
      venue_name: event.venue_name,
      address: "",
      capacity: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: event.title,
        description: "",
        location: event.location,
        venue_name: event.venue_name,
        address: "",
        capacity: 0,
      });
    }
  }, [event, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: EventFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("venue_name", data.venue_name);
    formData.append("address", data.address);
    formData.append("capacity", data.capacity.toString());

    patchEvent(formData as any, {
      onSuccess: () => {
        toast.success("Event updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        onClose();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to update event",
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
            Edit Event
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-900/30 rounded-lg transition-colors"
          >
            <X size={24} className="text-primary-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              {...register("title")}
              className={`w-full px-4 py-3 bg-dark border ${
                errors.title
                  ? "border-red-500 focus:border-red-500"
                  : "border-primary-800 focus:border-primary-600"
              } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Description *
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className={`w-full px-4 py-3 bg-dark border ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-primary-800 focus:border-primary-600"
              } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all resize-none`}
              placeholder="Enter event description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Location & Venue */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                {...register("location")}
                className={`w-full px-4 py-3 bg-dark border ${
                  errors.location
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-800 focus:border-primary-600"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                placeholder="e.g., New York, NY"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.location.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-300 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                {...register("venue_name")}
                className={`w-full px-4 py-3 bg-dark border ${
                  errors.venue_name
                    ? "border-red-500 focus:border-red-500"
                    : "border-primary-800 focus:border-primary-600"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
                placeholder="e.g., Grand Hotel"
              />
              {errors.venue_name && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.venue_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Address *
            </label>
            <input
              type="text"
              {...register("address")}
              className={`w-full px-4 py-3 bg-dark border ${
                errors.address
                  ? "border-red-500 focus:border-red-500"
                  : "border-primary-800 focus:border-primary-600"
              } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
              placeholder="Enter complete address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-400">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-primary-300 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              {...register("capacity")}
              className={`w-full px-4 py-3 bg-dark border ${
                errors.capacity
                  ? "border-red-500 focus:border-red-500"
                  : "border-primary-800 focus:border-primary-600"
              } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all`}
              placeholder="Maximum number of guests"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-400">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-light border-t border-primary-900 p-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            type="submit"
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
      </div>
    </div>
  );
};

export default EditEventModal;
