import { useEffect, useState } from "react";
import {
  ScanLine,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Calendar,
  Download,
  Camera,
  Upload,
  UserCheck,
  History,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import AOS from "aos";

// Types
interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
}

interface ScanResult {
  success: boolean;
  guestName: string;
  company: string;
  email: string;
  alreadyCheckedIn: boolean;
}

interface CheckIn {
  id: number;
  guestName: string;
  company: string;
  time: string;
  method: string;
  status: "success" | "failed";
}

interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  avatar: string;
}

interface HourlyData {
  hour: string;
  count: number;
}

type TabType = "scan" | "manual" | "history";

const CheckIn = () => {
  const [activeTab, setActiveTab] = useState<TabType>("scan");
  const [selectedEvent, setSelectedEvent] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showEventDropdown, setShowEventDropdown] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  // Sample Events
  const events: Event[] = [
    {
      id: 1,
      name: "Tech Conference 2024",
      date: "2024-02-15",
      location: "Convention Center",
    },
    {
      id: 2,
      name: "Annual Gala Dinner",
      date: "2024-02-18",
      location: "Grand Hotel",
    },
    {
      id: 3,
      name: "Product Launch Event",
      date: "2024-02-20",
      location: "Innovation Hub",
    },
  ];

  const currentEvent = events.find((e) => e.id.toString() === selectedEvent);

  // Check-in Stats
  const stats = {
    totalGuests: 250,
    checkedIn: 187,
    pending: 63,
    checkedInPercentage: 75,
  };

  // Recent Check-ins
  const recentCheckIns: CheckIn[] = [
    {
      id: 1,
      guestName: "John Smith",
      company: "Tech Corp",
      time: "2 minutes ago",
      method: "QR Scan",
      status: "success",
    },
    {
      id: 2,
      guestName: "Sarah Johnson",
      company: "Design Studio",
      time: "5 minutes ago",
      method: "QR Scan",
      status: "success",
    },
    {
      id: 3,
      guestName: "Michael Brown",
      company: "Innovation Labs",
      time: "8 minutes ago",
      method: "Manual",
      status: "success",
    },
    {
      id: 4,
      guestName: "Emily Davis",
      company: "Marketing Pro",
      time: "12 minutes ago",
      method: "QR Scan",
      status: "success",
    },
    {
      id: 5,
      guestName: "Invalid QR Code",
      company: "N/A",
      time: "15 minutes ago",
      method: "QR Scan",
      status: "failed",
    },
  ];

  // Pending Guests (for manual check-in)
  const pendingGuests: Guest[] = [
    {
      id: 1,
      firstName: "David",
      lastName: "Wilson",
      email: "david.w@example.com",
      company: "Business Solutions",
      avatar: "DW",
    },
    {
      id: 2,
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.anderson@example.com",
      company: "Creative Agency",
      avatar: "LA",
    },
    {
      id: 3,
      firstName: "Robert",
      lastName: "Taylor",
      email: "robert.t@example.com",
      company: "Tech Innovations",
      avatar: "RT",
    },
  ];

  const filteredPendingGuests = pendingGuests.filter(
    (guest) =>
      guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Hourly Check-in Data (for chart)
  const hourlyData: HourlyData[] = [
    { hour: "8 AM", count: 15 },
    { hour: "9 AM", count: 45 },
    { hour: "10 AM", count: 68 },
    { hour: "11 AM", count: 32 },
    { hour: "12 PM", count: 27 },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.count));

  const handleScan = () => {
    setIsScanning(true);
    // Simulate QR scan
    setTimeout(() => {
      setScanResult({
        success: true,
        guestName: "John Smith",
        company: "Tech Corp",
        email: "john.smith@example.com",
        alreadyCheckedIn: false,
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleManualCheckIn = (guestId: number) => {
    // Handle manual check-in logic
    console.log("Manual check-in for guest:", guestId);
  };

  // Calendar Functions
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const handleYearChange = (increment: number) => {
    setSelectedYear(selectedYear + increment);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
  };

  const handleDateSelect = (day: number) => {
    if (selectedMonth !== null) {
      const date = new Date(selectedYear, selectedMonth, day);
      setSelectedDate(date);

      // Format date for API: YYYY-MM-DD
      const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Send to backend
      fetchEventsByDate(formattedDate);

      setShowCalendar(false);
    }
  };

  const fetchEventsByDate = async (date: string) => {
    // TODO: Replace with actual API call
    console.log("Fetching events for date:", date);

    // Example API call:
    // try {
    //   const response = await axiosInstance.get(`/events?date=${date}`);
    //   // Handle response
    // } catch (error) {
    //   console.error("Error fetching events:", error);
    // }
  };

  const fetchEventsByYear = async (year: number) => {
    // TODO: Replace with actual API call
    console.log("Fetching events for year:", year);

    // Example API call:
    // try {
    //   const response = await axiosInstance.get(`/events?year=${year}`);
    //   // Handle response
    // } catch (error) {
    //   console.error("Error fetching events:", error);
    // }
  };

  const renderCalendar = () => {
    if (selectedMonth === null) {
      // Show month grid
      return (
        <div className="grid grid-cols-3 gap-3 p-4">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthSelect(index)}
              className="px-4 py-3 bg-dark border border-primary-800 hover:border-primary-600 hover:bg-primary-900/30 text-light rounded-lg font-medium transition-all"
            >
              {month}
            </button>
          ))}
        </div>
      );
    } else {
      // Show day grid
      const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
      const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
      const days = [];

      // Empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="p-2"></div>);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday =
          day === new Date().getDate() &&
          selectedMonth === new Date().getMonth() &&
          selectedYear === new Date().getFullYear();

        const isSelected =
          selectedDate &&
          day === selectedDate.getDate() &&
          selectedMonth === selectedDate.getMonth() &&
          selectedYear === selectedDate.getFullYear();

        days.push(
          <button
            key={day}
            onClick={() => handleDateSelect(day)}
            className={`p-2 rounded-lg font-medium transition-all ${
              isSelected
                ? "bg-primary-600 text-light"
                : isToday
                  ? "bg-primary-900/50 text-primary-400 border border-primary-700"
                  : "text-primary-300 hover:bg-primary-900/30 hover:text-light"
            }`}
          >
            {day}
          </button>,
        );
      }

      return (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-primary-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">{days}</div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-light mb-2">
            Check-in
          </h1>
          <p className="text-primary-300">
            Scan QR codes or manually check in guests
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <CalendarDays size={18} />
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : `Year: ${selectedYear}`}
            </button>

            {/* Calendar Dropdown */}
            {showCalendar && (
              <div className="absolute right-0 mt-2 w-80 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-20">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-primary-900">
                  <button
                    onClick={() =>
                      selectedMonth !== null
                        ? setSelectedMonth(null)
                        : handleYearChange(-1)
                    }
                    className="p-2 hover:bg-primary-900/30 rounded-lg transition-all"
                  >
                    <ChevronLeft size={20} className="text-primary-400" />
                  </button>
                  <div className="text-center">
                    <h3 className="font-semibold text-light">
                      {selectedMonth !== null
                        ? months[selectedMonth]
                        : "Select Month"}
                    </h3>
                    <p className="text-sm text-primary-400">{selectedYear}</p>
                  </div>
                  <button
                    onClick={() =>
                      selectedMonth !== null
                        ? setSelectedMonth(null)
                        : handleYearChange(1)
                    }
                    className="p-2 hover:bg-primary-900/30 rounded-lg transition-all"
                  >
                    <ChevronRight size={20} className="text-primary-400" />
                  </button>
                </div>

                {/* Calendar Body */}
                {renderCalendar()}

                {/* Footer */}
                <div className="p-4 border-t border-primary-900 flex gap-2">
                  <button
                    onClick={() => {
                      fetchEventsByYear(selectedYear);
                      setShowCalendar(false);
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all"
                  >
                    Get Year Events
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMonth(null);
                      setSelectedDate(null);
                      setShowCalendar(false);
                    }}
                    className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Event Selector */}
          <div className="relative">
            <button
              onClick={() => setShowEventDropdown(!showEventDropdown)}
              className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Calendar size={18} />
              {currentEvent?.name}
            </button>

            {showEventDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-dark border border-primary-900 rounded-xl shadow-2xl overflow-hidden z-10">
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
                    <p className="text-xs opacity-75">
                      {event.date} • {event.location}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
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
            {stats.totalGuests}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-green-900/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <p className="text-green-400 text-sm">Checked In</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.checkedIn}
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
              <TrendingUp size={20} className="text-blue-400" />
            </div>
            <p className="text-blue-400 text-sm">Check-in Rate</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {stats.checkedInPercentage}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-2"
        data-aos="fade-up"
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "scan"
                ? "bg-primary-600 text-light shadow-lg"
                : "text-primary-300 hover:bg-primary-900/30"
            }`}
          >
            <ScanLine size={18} />
            QR Scan
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "manual"
                ? "bg-primary-600 text-light shadow-lg"
                : "text-primary-300 hover:bg-primary-900/30"
            }`}
          >
            <UserCheck size={18} />
            Manual Check-in
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === "history"
                ? "bg-primary-600 text-light shadow-lg"
                : "text-primary-300 hover:bg-primary-900/30"
            }`}
          >
            <History size={18} />
            History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "scan" && (
            <div data-aos="fade-up">
              <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-8">
                <div className="text-center mb-8">
                  <h3 className="font-heading text-2xl font-bold text-light mb-2">
                    QR Code Scanner
                  </h3>
                  <p className="text-primary-400">
                    Position the QR code within the frame to scan
                  </p>
                </div>

                {/* Scanner Area */}
                <div className="relative aspect-square max-w-md mx-auto bg-dark border-2 border-dashed border-primary-700 rounded-xl overflow-hidden mb-6">
                  {isScanning ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark/50">
                      <div className="text-center">
                        <div className="inline-block p-4 bg-primary-900/50 rounded-full mb-4 animate-pulse">
                          <ScanLine size={48} className="text-primary-400" />
                        </div>
                        <p className="text-light font-semibold">Scanning...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block p-6 bg-primary-900/30 rounded-full mb-4">
                          <Camera size={64} className="text-primary-500" />
                        </div>
                        <p className="text-primary-400">
                          Camera will appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Scanning Lines Animation */}
                  {isScanning && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-primary-600 animate-scan"></div>
                  )}
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div
                    className={`p-6 rounded-xl mb-6 ${
                      scanResult.success
                        ? "bg-green-900/20 border-2 border-green-800"
                        : "bg-red-900/20 border-2 border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {scanResult.success ? (
                        <CheckCircle
                          size={32}
                          className="text-green-400 shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={32}
                          className="text-red-400 shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-heading text-lg font-bold text-light mb-2">
                          {scanResult.alreadyCheckedIn
                            ? "Already Checked In"
                            : "Check-in Successful!"}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-light">
                            <strong>Guest:</strong> {scanResult.guestName}
                          </p>
                          <p className="text-light">
                            <strong>Company:</strong> {scanResult.company}
                          </p>
                          <p className="text-light">
                            <strong>Email:</strong> {scanResult.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scan Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex-1 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <ScanLine size={20} />
                    {isScanning ? "Scanning..." : "Start Scanning"}
                  </button>
                  <button className="px-6 py-4 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload QR Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "manual" && (
            <div data-aos="fade-up">
              <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="font-heading text-2xl font-bold text-light mb-2">
                    Manual Check-in
                  </h3>
                  <p className="text-primary-400">
                    Search and check in guests manually
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Search guests by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark border border-primary-800 rounded-lg text-light placeholder-primary-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 transition-all"
                  />
                </div>

                {/* Pending Guests List */}
                <div className="space-y-3">
                  {filteredPendingGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center gap-4 p-4 bg-dark border border-primary-900 hover:border-primary-700 rounded-xl transition-all"
                    >
                      <div className="w-12 h-12 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-bold text-light">
                        {guest.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-light">
                          {guest.firstName} {guest.lastName}
                        </h4>
                        <p className="text-sm text-primary-400 truncate">
                          {guest.email}
                        </p>
                        <p className="text-xs text-primary-500">
                          {guest.company}
                        </p>
                      </div>
                      <button
                        onClick={() => handleManualCheckIn(guest.id)}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Check In
                      </button>
                    </div>
                  ))}
                </div>

                {filteredPendingGuests.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-block p-4 bg-primary-900/20 rounded-full mb-4">
                      <Users size={48} className="text-primary-500" />
                    </div>
                    <p className="text-primary-400">No pending guests found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div data-aos="fade-up">
              <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="font-heading text-2xl font-bold text-light mb-2">
                    Check-in History
                  </h3>
                  <p className="text-primary-400">Recent check-in activities</p>
                </div>

                <div className="space-y-3">
                  {recentCheckIns.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="flex items-center gap-4 p-4 bg-dark border border-primary-900 rounded-xl"
                    >
                      {checkin.status === "success" ? (
                        <div className="p-2 bg-green-900/30 rounded-lg">
                          <CheckCircle size={20} className="text-green-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-900/30 rounded-lg">
                          <XCircle size={20} className="text-red-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-light">
                          {checkin.guestName}
                        </h4>
                        <p className="text-sm text-primary-400">
                          {checkin.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-primary-900/30 border border-primary-800 rounded-full text-xs font-medium text-primary-400">
                          {checkin.method}
                        </span>
                        <p className="text-xs text-primary-500 mt-1">
                          {checkin.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Hourly Check-ins Chart */}
        <div className="space-y-6">
          <div data-aos="fade-up" data-aos-delay="100">
            <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-light mb-4">
                Hourly Check-ins
              </h3>
              <div className="space-y-3">
                {hourlyData.map((data, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-primary-400">{data.hour}</span>
                      <span className="font-semibold text-light">
                        {data.count}
                      </span>
                    </div>
                    <div className="h-8 bg-primary-900/30 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary-600 to-primary-700 rounded-lg transition-all duration-500"
                        style={{ width: `${(data.count / maxHourly) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div data-aos="fade-up" data-aos-delay="200">
            <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6">
              <h3 className="font-heading text-xl font-bold text-light mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-primary-400 text-sm">
                    Average Check-in Time
                  </span>
                  <span className="font-semibold text-light">12 seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-400 text-sm">Peak Hour</span>
                  <span className="font-semibold text-light">10:00 AM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-400 text-sm">Failed Scans</span>
                  <span className="font-semibold text-red-400">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-400 text-sm">
                    Manual Check-ins
                  </span>
                  <span className="font-semibold text-light">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
