import { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  MapPin,
  Grid,
  List,
  Loader2,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import AOS from "aos";
import { Link } from "react-router-dom";
import { useEvents, useDeleteEvent } from "../hooks/useEvent";
import type { EventListItem, EventStatus } from "../services/eventService";
import ViewEventModal from "./components/ViewEventModal";
import EditEventModal from "./components/EditEventModal";
import { toast } from "react-toastify";

const Events = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<EventStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventListItem | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [copiedEventId, setCopiedEventId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEvent, setShareEvent] = useState<EventListItem | null>(null);

  // Fetch events with proper default
  const {
    data: eventsData,
    isLoading,
    error,
  } = useEvents({
    ordering: "-created_at",
    ...(filterStatus !== "all" && { status: filterStatus }),
    ...(searchQuery && { search: searchQuery }),
  });

  // Ensure events is always an array
  const events = Array.isArray(eventsData) ? eventsData : [];

  const { mutate: deleteEvent, isPending:isDeleting} = useDeleteEvent();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Stats with type assertion
  const stats = {
    total: events.length,
    upcoming: events.filter((e) => e.status === ("upcoming" as EventStatus))
      .length,
    completed: events.filter((e) => e.status === ("completed" as EventStatus))
      .length,
    draft: events.filter((e) => e.status === ("draft" as EventStatus)).length,
    cancelled: events.filter((e) => e.status === ("cancelled" as EventStatus))
      .length,
  };

  const getStatusColor = (status: EventStatus) => {
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

  const handleView = (event: EventListItem) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const handleEdit = (event: EventListItem) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteClick = (eventId: number) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete, {
        onSuccess: () => {
          toast.success("Event deleted successfully!");
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to delete event"
          );
        },
      });
    }
  };

  const handleCopyTicketLink = async (event: EventListItem) => {
    const ticketLink =
      event.ticket_purchase_link ||
      `${window.location.origin}/events/${event.slug}/tickets`;

    try {
      await navigator.clipboard.writeText(ticketLink);
      setCopiedEventId(event.id);
      toast.success("Ticket link copied to clipboard!");
      setTimeout(() => setCopiedEventId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (event: EventListItem) => {
    const ticketLink =
      event.ticket_purchase_link ||
      `${window.location.origin}/events/${event.slug}/tickets`;

    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: `Get your tickets for ${event.title}`,
          url: ticketLink,
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Error sharing:", error);
          }
        });
    } else {
      setShareEvent(event);
      setShowShareModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-primary-300">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex p-6 bg-red-900/20 rounded-full mb-4">
            <Calendar size={48} className="text-red-500" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-light mb-2">
            Failed to load events
          </h3>
          <p className="text-primary-400 mb-6">
            {(error as any)?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  const filterOptions: Array<{ value: EventStatus | "all"; label: string }> = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Completed" },
    { value: "draft", label: "Draft" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Events
          </h1>
          <p className="text-primary-300">
            Manage all your events in one place
          </p>
        </div>
        <Link to="/dashboard/create-event" className="w-full lg:w-auto">
          <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 w-full lg:w-auto">
            <Plus size={20} />
            Create New Event
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-aos="fade-up">
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
          <p className="text-primary-400 text-sm mb-1">Total Events</p>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.total}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-blue-900/50 rounded-xl p-4">
          <p className="text-blue-400 text-sm mb-1">Upcoming</p>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.upcoming}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-green-900/50 rounded-xl p-4">
          <p className="text-green-400 text-sm mb-1">Completed</p>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.completed}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-yellow-900/50 rounded-xl p-4">
          <p className="text-yellow-400 text-sm mb-1">Drafts</p>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.draft}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4"
        data-aos="fade-up"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
            />
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg font-medium transition-all flex items-center gap-2 w-full lg:w-auto justify-center"
            >
              <Filter size={18} />
              Filter:{" "}
              {filterOptions.find((opt) => opt.value === filterStatus)?.label ||
                "All"}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-50">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterStatus(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      filterStatus === option.value
                        ? "bg-primary-600 text-light"
                        : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-primary-600 text-light"
                  : "bg-dark border border-primary-800 text-primary-400 hover:border-primary-600"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg font-medium transition-all ${
                viewMode === "list"
                  ? "bg-primary-600 text-light"
                  : "bg-dark border border-primary-800 text-primary-400 hover:border-primary-600"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div
              key={event.id}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 hover:border-primary-700 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-900/20 group"
            >
              {/* Event Image */}
              <div className="h-32 bg-linear-to-br from-primary-900/30 to-primary-800/30 flex items-center justify-center">
                {event.banner_image ? (
                  <img
                    src={event.banner_image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Calendar size={48} className="text-primary-500" />
                )}
              </div>

              {/* Event Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                  >
                    {event.status}
                  </span>
                  <div className="relative">
                    <button className="p-1 hover:bg-primary-900 rounded transition-colors">
                      <MoreVertical size={18} className="text-primary-500" />
                    </button>
                  </div>
                </div>

                <h3 className="font-heading text-lg font-bold text-light mb-2 line-clamp-1">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-primary-300">
                    <Calendar size={14} className="text-primary-500" />
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-300">
                    <MapPin size={14} className="text-primary-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-300">
                    <Users size={14} className="text-primary-500" />
                    {event.total_guests} registered
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-primary-400 mb-2">
                    <span>Attendance</span>
                    <span>{event.attendance_rate}%</span>
                  </div>
                  <div className="h-2 bg-primary-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary-600 to-primary-700 rounded-full transition-all duration-500"
                      style={{
                        width: `${event.attendance_rate}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Share Ticket Link - Show only if event has tickets */}
                {event.has_tickets && (
                  <div className="mb-4 flex items-center gap-2">
                    <button
                      onClick={() => handleCopyTicketLink(event)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-light text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Copy ticket link"
                    >
                      {copiedEventId === event.id ? (
                        <>
                          <Check size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(event)}
                      className="px-3 py-2 bg-dark border border-primary-800 hover:border-blue-600 text-primary-300 hover:text-blue-400 text-xs font-medium rounded-lg transition-all"
                      title="Share ticket link"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleView(event)}
                    className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-light text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="px-3 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 text-sm font-medium rounded-lg transition-all"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event.id)}
                    className="px-3 py-2 bg-dark border border-primary-800 hover:border-red-600 text-primary-300 hover:text-red-400 text-sm font-medium rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={event.id}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 hover:border-primary-700 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-primary-900/20"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Event Icon */}
                <div className="w-16 h-16 bg-linear-to-br from-primary-900/30 to-primary-800/30 rounded-xl flex items-center justify-center shrink-0">
                  {event.banner_image ? (
                    <img
                      src={event.banner_image}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Calendar size={32} className="text-primary-500" />
                  )}
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="font-heading text-lg font-bold text-light">
                      {event.title}
                    </h3>
                    <span
                      className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm text-primary-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary-500" />
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-primary-500" />
                      {event.total_guests} registered
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Share buttons - Show only if event has tickets */}
                  {event.has_tickets && (
                    <>
                      <button
                        onClick={() => handleCopyTicketLink(event)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-light text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        title="Copy ticket link"
                      >
                        {copiedEventId === event.id ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy Link
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleShare(event)}
                        className="p-2 bg-dark border border-primary-800 hover:border-blue-600 text-primary-300 hover:text-blue-400 rounded-lg transition-all"
                        title="Share"
                      >
                        <Share2 size={16} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleView(event)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event.id)}
                    className="p-2 bg-dark border border-primary-800 hover:border-red-600 text-primary-300 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-16" data-aos="fade-up">
          <div className="inline-flex p-6 bg-primary-900/20 rounded-full mb-4">
            <Calendar size={48} className="text-primary-500" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-light mb-2">
            No events found
          </h3>
          <p className="text-primary-400 mb-6">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by creating your first event"}
          </p>
          <Link to="/dashboard/create-event">
            <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2">
              <Plus size={20} />
              Create Your First Event
            </button>
          </Link>
        </div>
      )}

      {/* Modals */}
      {selectedEvent && (
        <>
          <ViewEventModal
            event={selectedEvent}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedEvent(null);
            }}
          />
          <EditEventModal
            event={selectedEvent}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
          />
        </>
      )}

      {/* Share Modal */}
      {showShareModal && shareEvent && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-dark-light border border-primary-900 rounded-xl max-w-md w-full p-6"
            data-aos="zoom-in"
          >
            <h3 className="font-heading text-xl font-bold text-light mb-4">
              Share Ticket Link
            </h3>

            <div className="bg-dark border border-primary-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-primary-300 break-all">
                {shareEvent.ticket_purchase_link ||
                  `${window.location.origin}/events/${shareEvent.slug}/tickets`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopyTicketLink(shareEvent)}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {copiedEventId === shareEvent.id ? (
                  <>
                    <Check size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy Link
                  </>
                )}
              </button>
              
                <a href={
                  shareEvent.ticket_purchase_link ||
                  `${window.location.origin}/events/${shareEvent.slug}/tickets`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Preview
              </a>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareEvent(null);
                }}
                className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-dark-light border border-primary-900 rounded-xl max-w-md w-full p-6"
            data-aos="zoom-in"
          >
            <h3 className="font-heading text-xl font-bold text-light mb-3">
              Delete Event
            </h3>
            <p className="text-primary-300 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEventToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-light rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;