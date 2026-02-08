import {
  X,
  Calendar,
  MapPin,
  Building,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";
import type { EventListItem } from "../../services/eventService";
import { useEvent } from "../../hooks/useEvent";

interface ViewEventModalProps {
  event: EventListItem;
  isOpen: boolean;
  onClose: () => void;
}

const ViewEventModal = ({ event, isOpen, onClose }: ViewEventModalProps) => {
  const { data: eventDetails, isLoading } = useEvent(event.id);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-900/30 text-blue-400 border-blue-800";
      case "completed":
        return "bg-green-900/30 text-green-400 border-green-800";
      case "draft":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-800";
      case "cancelled":
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
        <div className="sticky top-0 bg-dark-light border-b border-primary-900 p-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-light mb-2">
              Event Details
            </h2>
            <span
              className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
            >
              {event.status}
            </span>
          </div>
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
            <div className="inline-block w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-primary-300">Loading event details...</p>
          </div>
        ) : eventDetails ? (
          <div className="p-6 space-y-6">
            {/* Banner Image */}
            {eventDetails.banner_image && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={eventDetails.banner_image}
                  alt={eventDetails.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Title & Description */}
            <div>
              <h3 className="font-heading text-2xl font-bold text-light mb-3">
                {eventDetails.title}
              </h3>
              <p className="text-primary-300 leading-relaxed">
                {eventDetails.description}
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">Start Date</p>
                    <p className="text-light font-medium">
                      {new Date(eventDetails.event_date).toLocaleString(
                        "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">End Date</p>
                    <p className="text-light font-medium">
                      {new Date(eventDetails.event_end_date).toLocaleString(
                        "en-US",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">Location</p>
                    <p className="text-light font-medium">
                      {eventDetails.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                <div className="flex items-start gap-3">
                  <Building className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">Venue</p>
                    <p className="text-light font-medium">
                      {eventDetails.venue_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900 md:col-span-2">
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">Address</p>
                    <p className="text-light font-medium">
                      {eventDetails.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                <div className="flex items-start gap-3">
                  <Users className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">Capacity</p>
                    <p className="text-light font-medium">
                      {eventDetails.total_guests} / {eventDetails.capacity}{" "}
                      guests
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-primary-400 text-sm mb-1">Checked In</p>
                    <p className="text-light font-medium">
                      {eventDetails.checked_in_count} guests (
                      {eventDetails.attendance_rate}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Settings */}
            <div>
              <h4 className="font-heading text-lg font-bold text-light mb-3">
                Event Settings
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-primary-900/20 rounded-lg border border-primary-900">
                  <span className="text-primary-300">Allow Plus One</span>
                  <span
                    className={`text-sm font-medium ${eventDetails.allow_plus_one ? "text-green-400" : "text-red-400"}`}
                  >
                    {eventDetails.allow_plus_one ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-900/20 rounded-lg border border-primary-900">
                  <span className="text-primary-300">Require RSVP</span>
                  <span
                    className={`text-sm font-medium ${eventDetails.require_rsvp ? "text-green-400" : "text-red-400"}`}
                  >
                    {eventDetails.require_rsvp ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-900/20 rounded-lg border border-primary-900">
                  <span className="text-primary-300">Self Check-in</span>
                  <span
                    className={`text-sm font-medium ${eventDetails.enable_self_checkin ? "text-green-400" : "text-red-400"}`}
                  >
                    {eventDetails.enable_self_checkin ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-900/20 rounded-lg border border-primary-900">
                  <span className="text-primary-300">Public Event</span>
                  <span
                    className={`text-sm font-medium ${eventDetails.is_public ? "text-green-400" : "text-red-400"}`}
                  >
                    {eventDetails.is_public ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            {/* Check-in Time Window */}
            {eventDetails.enable_self_checkin &&
              (eventDetails.checkin_start_time ||
                eventDetails.checkin_end_time) && (
                <div>
                  <h4 className="font-heading text-lg font-bold text-light mb-3">
                    Check-in Window
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {eventDetails.checkin_start_time && (
                      <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                        <div className="flex items-start gap-3">
                          <Clock className="text-primary-500 mt-1" size={20} />
                          <div>
                            <p className="text-primary-400 text-sm mb-1">
                              Start Time
                            </p>
                            <p className="text-light font-medium">
                              {new Date(
                                eventDetails.checkin_start_time,
                              ).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {eventDetails.checkin_end_time && (
                      <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                        <div className="flex items-start gap-3">
                          <Clock className="text-primary-500 mt-1" size={20} />
                          <div>
                            <p className="text-primary-400 text-sm mb-1">
                              End Time
                            </p>
                            <p className="text-light font-medium">
                              {new Date(
                                eventDetails.checkin_end_time,
                              ).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Organizer Info */}
            {eventDetails.organizer_details && (
              <div>
                <h4 className="font-heading text-lg font-bold text-light mb-3">
                  Organizer
                </h4>
                <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-900">
                  <p className="text-light font-medium mb-1">
                    {eventDetails.organizer_details.full_name}
                  </p>
                  <p className="text-primary-300 text-sm">
                    {eventDetails.organizer_details.email}
                  </p>
                  {eventDetails.organizer_details.organization && (
                    <p className="text-primary-400 text-sm mt-1">
                      {eventDetails.organizer_details.organization}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-primary-300">Failed to load event details</p>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-light border-t border-primary-900 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEventModal;
