import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Download,
  Upload,
  UserPlus,
  Grid,
  List,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import AOS from "aos";
import { useGuests, useDeleteGuest } from "../hooks/useGuest";
import { useSendBulkInvites } from "../hooks/useNotifications";
import { useBulkGenerateQRCodes } from "../hooks/useQRCode";
import { useEvents } from "../hooks/useEvent";
import { toast } from "react-toastify";
import ViewGuestModal from "./components/ViewGuestModal";
import EditGuestModal from "./components/EditGuestModal";
import { Link } from "react-router-dom";

interface Event {
  id: number;
  name: string;
}

const Guests = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEvent, setFilterEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showEventDropdown, setShowEventDropdown] = useState<boolean>(false);
  const [selectedGuests, setSelectedGuests] = useState<number[]>([]);
  const [viewGuestId, setViewGuestId] = useState<number | null>(null);
  const [editGuestId, setEditGuestId] = useState<number | null>(null);

  // Hooks
  const { data: guestsData, isLoading, error } = useGuests();
  const { data: eventsData } = useEvents();
  const { mutate: deleteGuest } = useDeleteGuest();
  const { mutate: sendBulkInvites, isPending: isSendingInvites } =
    useSendBulkInvites();
  const { mutate: bulkGenerateQR, isPending: isGeneratingQR } =
    useBulkGenerateQRCodes();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Get events from API
  const events: Event[] =
    eventsData?.map((event) => ({
      id: event.id,
      name: event.title,
    })) || [];

  const guests = guestsData?.results || [];
  console.log(guests)

  // Filter guests
  const filteredGuests = guests.filter((guest) => {
    const matchesStatus =
      filterStatus === "all" || guest.status === filterStatus;
    const matchesEvent =
      filterEvent === "all" || guest.event === parseInt(filterEvent);
    const matchesSearch =
      guest.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesEvent && matchesSearch;
  });

  // Stats
  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.status === "confirmed").length,
    pending: guests.filter((g) => g.status === "pending").length,
    checkedIn: guests.filter((g) => g.has_checked_in).length,
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

  const handleSelectGuest = (guestId: number) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId)
        ? prev.filter((id) => id !== guestId)
        : [...prev, guestId],
    );
  };

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map((g) => g.id));
    }
  };

  const handleDeleteGuest = (guestId: number) => {
    if (window.confirm("Are you sure you want to delete this guest?")) {
      deleteGuest(guestId, {
        onSuccess: () => {
          toast.success("Guest deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
          });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to delete guest",
            {
              position: "top-right",
              autoClose: 5000,
              theme: "dark",
            },
          );
        },
      });
    }
  };

  const handleSendBulkInvites = () => {
    sendBulkInvites(
      { guest_ids: selectedGuests },
      {
        onSuccess: (data) => {
          toast.success(data.message, {
            position: "top-right",
            autoClose: 3000,
            theme: "dark",
          });
          setSelectedGuests([]);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to send invitations",
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

  const handleBulkGenerateQR = () => {
    bulkGenerateQR(selectedGuests, {
      onSuccess: () => {
        toast.success("QR codes generated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        setSelectedGuests([]);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to generate QR codes",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "dark",
          },
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-primary-400">Loading guests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Failed to load guests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light mb-2">
            Guests
          </h1>
          <p className="text-sm sm:text-base text-primary-300">
            Manage all your event guests
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2 text-sm sm:text-base">
            <Upload size={18} />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
          </button>
          <button className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2 text-sm sm:text-base">
            <Download size={18} />
            Export
          </button>
          <Link to="/dashboard/add-guest">
            <button className="px-4 sm:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2 text-sm sm:text-base">
              <UserPlus size={20} />
              <span className="hidden sm:inline">Add Guest</span>
              <span className="sm:hidden">Add</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-aos="fade-up">
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <Users size={20} className="text-primary-400" />
            </div>
            <p className="text-primary-400 text-sm">Total Guests</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.total}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-green-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <p className="text-green-400 text-sm">Confirmed</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.confirmed}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-yellow-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <p className="text-yellow-400 text-sm">Pending</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.pending}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-blue-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <CheckCircle size={20} className="text-blue-400" />
            </div>
            <p className="text-blue-400 text-sm">Checked In</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.checkedIn}
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
              placeholder="Search guests by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all text-sm"
            />
          </div>

          {/* Event Filter */}
          <div className="relative">
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg font-medium transition-all flex items-center gap-2 w-full lg:w-auto justify-center text-sm"
            >
              <Calendar size={18} />
              <span className="truncate">
                Event:{" "}
                {filterEvent === "all"
                  ? "All"
                  : events.find((e) => e.id.toString() === filterEvent)?.name}
              </span>
            </button>

            {showEventDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-10">
                <button
                  onClick={() => {
                    setFilterEvent("all");
                    setShowEventDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    filterEvent === "all"
                      ? "bg-primary-600 text-light"
                      : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                  }`}
                >
                  All Events
                </button>
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setFilterEvent(event.id.toString());
                      setShowEventDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      filterEvent === event.id.toString()
                        ? "bg-primary-600 text-light"
                        : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                    }`}
                  >
                    {event.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg font-medium transition-all flex items-center gap-2 w-full lg:w-auto justify-center text-sm"
            >
              <Filter size={18} />
              Status:{" "}
              {filterStatus === "all"
                ? "All"
                : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-10">
                {["all", "confirmed", "pending", "declined"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      filterStatus === status
                        ? "bg-primary-600 text-light"
                        : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                    }`}
                  >
                    {status === "all"
                      ? "All Status"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
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

        {/* Bulk Actions */}
        {selectedGuests.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-sm text-primary-300">
              {selectedGuests.length} guest
              {selectedGuests.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSendBulkInvites}
                disabled={isSendingInvites}
                className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSendingInvites ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                Send Invites
              </button>
              <button
                onClick={handleBulkGenerateQR}
                disabled={isGeneratingQR}
                className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingQR ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <QrCode size={14} />
                )}
                Generate QR
              </button>
              <button className="px-4 py-2 bg-dark border border-red-800 hover:border-red-600 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guests Content */}
      {viewMode === "list" ? (
        <div
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl overflow-hidden"
          data-aos="fade-up"
        >
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark border-b border-primary-900">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={
                        selectedGuests.length === filteredGuests.length &&
                        filteredGuests.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 bg-dark border-primary-800 rounded text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-primary-300">
                    Guest
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-primary-300">
                    Contact
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-primary-300">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-primary-300">
                    RSVP
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-primary-300">
                    Check-in
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-primary-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-primary-900 hover:bg-primary-900/20 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedGuests.includes(guest.id)}
                        onChange={() => handleSelectGuest(guest.id)}
                        className="w-4 h-4 bg-dark border-primary-800 rounded text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-semibold text-light text-sm">
                          {guest.first_name[0]}
                          {guest.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-light">
                            {guest.full_name}
                          </p>
                          {guest.company && (
                            <p className="text-xs text-primary-400">
                              {guest.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-primary-300">
                          <Mail size={12} className="text-primary-500" />
                          <span className="truncate max-w-50">
                            {guest.email}
                          </span>
                        </div>
                        {guest.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-primary-300">
                            <Phone size={12} className="text-primary-500" />
                            {guest.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}
                      >
                        {guest.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {guest.rsvp_status ? (
                        <CheckCircle size={18} className="text-green-400" />
                      ) : (
                        <XCircle size={18} className="text-red-400" />
                      )}
                    </td>
                    <td className="p-4">
                      {guest.has_checked_in ? (
                        <CheckCircle size={18} className="text-blue-400" />
                      ) : (
                        <Clock size={18} className="text-primary-500" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewGuestId(guest.id)}
                          className="p-2 hover:bg-primary-900 rounded-lg transition-colors"
                          title="View Guest"
                        >
                          <Eye size={16} className="text-primary-400" />
                        </button>
                        <button
                          onClick={() => setEditGuestId(guest.id)}
                          className="p-2 hover:bg-primary-900 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} className="text-primary-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="p-2 hover:bg-red-900 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGuests.map((guest, index) => (
            <div
              key={guest.id}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="bg-linear-to-br from-dark-light to-dark border border-primary-900 hover:border-primary-700 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-primary-900/20"
            >
              <div className="flex items-start justify-between mb-4">
                <input
                  type="checkbox"
                  checked={selectedGuests.includes(guest.id)}
                  onChange={() => handleSelectGuest(guest.id)}
                  className="w-4 h-4 bg-dark border-primary-800 rounded text-primary-600 focus:ring-primary-600 focus:ring-offset-0"
                />
                <span
                  className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}
                >
                  {guest.status}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-bold text-light text-lg">
                  {guest.first_name[0]}
                  {guest.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg font-bold text-light truncate">
                    {guest.full_name}
                  </h3>
                  {guest.company && (
                    <p className="text-sm text-primary-400 truncate">
                      {guest.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-primary-300">
                  <Mail size={14} className="text-primary-500 shrink-0" />
                  <span className="truncate">{guest.email}</span>
                </div>
                {guest.phone_number && (
                  <div className="flex items-center gap-2 text-sm text-primary-300">
                    <Phone size={14} className="text-primary-500 shrink-0" />
                    {guest.phone_number}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4 pt-4 border-t border-primary-900">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-400">RSVP:</span>
                  {guest.rsvp_status ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-400">Check-in:</span>
                  {guest.has_checked_in ? (
                    <CheckCircle size={16} className="text-blue-400" />
                  ) : (
                    <Clock size={16} className="text-primary-500" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewGuestId(guest.id)}
                  className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-light text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => setEditGuestId(guest.id)}
                  className="px-3 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 text-sm font-medium rounded-lg transition-all"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteGuest(guest.id)}
                  className="px-3 py-2 bg-dark border border-red-800 hover:border-red-600 text-red-400 text-sm font-medium rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredGuests.length === 0 && (
        <div className="text-center py-16" data-aos="fade-up">
          <div className="inline-flex p-6 bg-primary-900/20 rounded-full mb-4">
            <Users size={48} className="text-primary-500" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-light mb-2">
            No guests found
          </h3>
          <p className="text-primary-400 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg inline-flex items-center gap-2">
            <UserPlus size={20} />
            Add Your First Guest
          </button>
        </div>
      )}

      {/* Modals */}
      {viewGuestId && (
        <ViewGuestModal
          guestId={viewGuestId}
          isOpen={!!viewGuestId}
          onClose={() => setViewGuestId(null)}
          onEdit={() => {
            setEditGuestId(viewGuestId);
            setViewGuestId(null);
          }}
        />
      )}

      {editGuestId && (
        <EditGuestModal
          guestId={editGuestId}
          isOpen={!!editGuestId}
          onClose={() => setEditGuestId(null)}
        />
      )}
    </div>
  );
};

export default Guests;
