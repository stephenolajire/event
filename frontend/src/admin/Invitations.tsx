import { useEffect, useState } from "react";
import {
  Mail,
  Search,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  Clock,
  RefreshCw,
  FileDown,
  Filter,
  MoreVertical,
} from "lucide-react";
import AOS from "aos";
import { toast } from "react-toastify";

// TypeScript Interfaces
interface Event {
  id: number;
  name: string;
  date: string;
}

interface SentInvitation {
  id: number;
  guestName: string;
  email: string;
  company: string;
  eventId: number;
  eventName: string;
  sentDate: string;
  sentTime: string;
  opened: boolean;
  openedDate?: string;
  openedTime?: string;
  clicks: number;
  rsvpStatus: "confirmed" | "pending" | "declined";
  avatar: string;
}

const Invitations: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showEventDropdown, setShowEventDropdown] = useState<boolean>(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Sample Events
  const events: Event[] = [
    { id: 1, name: "Tech Conference 2024", date: "2024-02-15" },
    { id: 2, name: "Annual Gala Dinner", date: "2024-02-18" },
    { id: 3, name: "Product Launch Event", date: "2024-02-20" },
  ];

  // Sample Sent Invitations Data
  const sentInvitations: SentInvitation[] = [
    {
      id: 1,
      guestName: "John Smith",
      email: "john.smith@example.com",
      company: "Tech Corp",
      eventId: 1,
      eventName: "Tech Conference 2024",
      sentDate: "2024-01-15",
      sentTime: "10:30 AM",
      opened: true,
      openedDate: "2024-01-16",
      openedTime: "9:15 AM",
      clicks: 3,
      rsvpStatus: "confirmed",
      avatar: "JS",
    },
    {
      id: 2,
      guestName: "Sarah Johnson",
      email: "sarah.j@example.com",
      company: "Design Studio",
      eventId: 1,
      eventName: "Tech Conference 2024",
      sentDate: "2024-01-18",
      sentTime: "2:45 PM",
      opened: true,
      openedDate: "2024-01-18",
      openedTime: "3:20 PM",
      clicks: 5,
      rsvpStatus: "confirmed",
      avatar: "SJ",
    },
    {
      id: 3,
      guestName: "Michael Brown",
      email: "michael.b@example.com",
      company: "Innovation Labs",
      eventId: 1,
      eventName: "Tech Conference 2024",
      sentDate: "2024-01-20",
      sentTime: "11:00 AM",
      opened: false,
      clicks: 0,
      rsvpStatus: "pending",
      avatar: "MB",
    },
    {
      id: 4,
      guestName: "Emily Davis",
      email: "emily.davis@example.com",
      company: "Marketing Pro",
      eventId: 2,
      eventName: "Annual Gala Dinner",
      sentDate: "2024-01-22",
      sentTime: "9:00 AM",
      opened: true,
      openedDate: "2024-01-22",
      openedTime: "10:30 AM",
      clicks: 2,
      rsvpStatus: "confirmed",
      avatar: "ED",
    },
    {
      id: 5,
      guestName: "David Wilson",
      email: "david.w@example.com",
      company: "Business Solutions",
      eventId: 2,
      eventName: "Annual Gala Dinner",
      sentDate: "2024-01-25",
      sentTime: "3:30 PM",
      opened: false,
      clicks: 0,
      rsvpStatus: "pending",
      avatar: "DW",
    },
  ];

  // Filter invitations
  const filteredInvitations = sentInvitations.filter((invitation) => {
    const matchesEvent =
      selectedEvent === "all" ||
      invitation.eventId.toString() === selectedEvent;

    const matchesSearch =
      invitation.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.company.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "opened") matchesStatus = invitation.opened;
    if (filterStatus === "not-opened") matchesStatus = !invitation.opened;
    if (filterStatus === "confirmed")
      matchesStatus = invitation.rsvpStatus === "confirmed";

    return matchesEvent && matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total:
      selectedEvent === "all"
        ? sentInvitations.length
        : sentInvitations.filter(
            (inv) => inv.eventId.toString() === selectedEvent,
          ).length,
    opened:
      selectedEvent === "all"
        ? sentInvitations.filter((inv) => inv.opened).length
        : sentInvitations.filter(
            (inv) => inv.eventId.toString() === selectedEvent && inv.opened,
          ).length,
    notOpened:
      selectedEvent === "all"
        ? sentInvitations.filter((inv) => !inv.opened).length
        : sentInvitations.filter(
            (inv) => inv.eventId.toString() === selectedEvent && !inv.opened,
          ).length,
    confirmed:
      selectedEvent === "all"
        ? sentInvitations.filter((inv) => inv.rsvpStatus === "confirmed").length
        : sentInvitations.filter(
            (inv) =>
              inv.eventId.toString() === selectedEvent &&
              inv.rsvpStatus === "confirmed",
          ).length,
  };

  const openRate =
    stats.total > 0 ? Math.round((stats.opened / stats.total) * 100) : 0;

  const handleExport = async (format: "csv" | "pdf"): Promise<void> => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        `Exported ${filteredInvitations.length} invitations as ${format.toUpperCase()}`,
        {
          position: "top-right",
          theme: "dark",
        },
      );
    } catch (error) {
      toast.error("Export failed", {
        position: "top-right",
        theme: "dark",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRsvpStatusColor = (status: string): string => {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Sent Invitations
          </h1>
          <p className="text-primary-300">
            Track and manage all sent event invitations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2"
          >
            {isExporting ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
          >
            {isExporting ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" data-aos="fade-up">
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <Mail size={20} className="text-primary-400" />
            </div>
            <p className="text-primary-400 text-sm">Total Sent</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.total}
          </p>
        </div>

        <div className="bg-linear-to-br from-dark-light to-dark border border-green-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Eye size={20} className="text-green-400" />
            </div>
            <p className="text-green-400 text-sm">Opened</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.opened}
          </p>
        </div>

        <div className="bg-linear-to-br from-dark-light to-dark border border-yellow-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Clock size={20} className="text-yellow-400" />
            </div>
            <p className="text-yellow-400 text-sm">Not Opened</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.notOpened}
          </p>
        </div>

        <div className="bg-linear-to-br from-dark-light to-dark border border-blue-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <CheckCircle size={20} className="text-blue-400" />
            </div>
            <p className="text-blue-400 text-sm">Confirmed</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.confirmed}
          </p>
        </div>

        <div className="bg-linear-to-br from-dark-light to-dark border border-purple-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <Mail size={20} className="text-purple-400" />
            </div>
            <p className="text-purple-400 text-sm">Open Rate</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {openRate}%
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
              placeholder="Search by guest name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
            />
          </div>

          {/* Event Filter */}
          <div className="relative">
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg font-medium transition-all flex items-center gap-2 w-full lg:w-auto justify-center"
            >
              <Calendar size={18} />
              {selectedEvent === "all"
                ? "All Events"
                : events.find((e) => e.id.toString() === selectedEvent)?.name}
            </button>

            {showEventDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-10">
                <button
                  onClick={() => {
                    setSelectedEvent("all");
                    setShowEventDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedEvent === "all"
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
                      setSelectedEvent(event.id.toString());
                      setShowEventDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      selectedEvent === event.id.toString()
                        ? "bg-primary-600 text-light"
                        : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
                    }`}
                  >
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-xs opacity-75">{event.date}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg font-medium transition-all flex items-center gap-2 w-full lg:w-auto justify-center"
            >
              <Filter size={18} />
              {filterStatus === "all" && "All Status"}
              {filterStatus === "opened" && "Opened"}
              {filterStatus === "not-opened" && "Not Opened"}
              {filterStatus === "confirmed" && "Confirmed"}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-10">
                {[
                  { value: "all", label: "All Status" },
                  { value: "opened", label: "Opened" },
                  { value: "not-opened", label: "Not Opened" },
                  { value: "confirmed", label: "Confirmed" },
                ].map((option) => (
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
        </div>
      </div>

      {/* Invitations Table */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl overflow-hidden"
        data-aos="fade-up"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark border-b border-primary-900">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  Guest
                </th>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  Email
                </th>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  Event
                </th>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  Sent Date
                </th>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  Opened
                </th>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  Clicks
                </th>
                <th className="text-left p-4 text-sm font-semibold text-primary-300">
                  RSVP
                </th>
                <th className="text-right p-4 text-sm font-semibold text-primary-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((invitation) => (
                <tr
                  key={invitation.id}
                  className="border-b border-primary-900 hover:bg-primary-900/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-semibold text-light text-sm">
                        {invitation.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-light">
                          {invitation.guestName}
                        </p>
                        <p className="text-xs text-primary-400">
                          {invitation.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-primary-300">
                      {invitation.email}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-light">
                      {invitation.eventName}
                    </p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm text-light">
                        {invitation.sentDate}
                      </p>
                      <p className="text-xs text-primary-500">
                        {invitation.sentTime}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {invitation.opened ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <Eye size={16} className="text-blue-400" />
                          <span className="text-sm text-blue-400">Yes</span>
                        </div>
                        <p className="text-xs text-primary-500 mt-1">
                          {invitation.openedDate} {invitation.openedTime}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-yellow-400" />
                        <span className="text-sm text-yellow-400">No</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-light">
                      {invitation.clicks}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 border rounded-full text-xs font-medium ${getRsvpStatusColor(invitation.rsvpStatus)}`}
                    >
                      {invitation.rsvpStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 hover:bg-primary-900 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} className="text-primary-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-primary-900 rounded-lg transition-colors"
                        title="Resend"
                      >
                        <RefreshCw size={16} className="text-primary-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-primary-900 rounded-lg transition-colors"
                        title="More Options"
                      >
                        <MoreVertical size={16} className="text-primary-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredInvitations.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-primary-900/20 rounded-full mb-4">
              <Mail size={48} className="text-primary-500" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-light mb-2">
              No sent invitations found
            </h3>
            <p className="text-primary-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invitations;
