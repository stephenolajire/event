import api from "../constant/api";

export interface DashboardStats {
  total_events: number;
  upcoming_events: number;
  total_guests: number;
  total_checked_in: number;
  attendance_rate: number;
  recent_events: RecentEvent[];
}

export interface RecentEvent {
  id: number;
  title: string;
  event_date: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
}

export interface EventStats {
  event: EventInfo;
  guests: GuestStats;
  rsvp: RSVPStats;
  attendance_rate: number;
  capacity: CapacityStats;
  checkin_history: CheckinHistory[];
}

export interface EventInfo {
  id: number;
  title: string;
  date: string;
  location: string;
}

export interface GuestStats {
  total: number;
  checked_in: number;
  pending: number;
  confirmed: number;
  declined: number;
}

export interface RSVPStats {
  total_rsvp: number;
  pending_rsvp: number;
}

export interface CapacityStats {
  total: number;
  used: number;
  available: number;
}

export interface CheckinHistory {
  guest_name: string;
  checked_in_at: string;
  guest_id: number;
}


const analyticsService = {
  
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/analytics/dashboard/");
    return response.data;
  },


  getEventStats: async (eventId: number): Promise<EventStats> => {
    const response = await api.get<EventStats>(
      `/analytics/events/${eventId}/stats/`,
    );
    return response.data;
  },

  exportGuestList: async (eventId: number): Promise<Blob> => {
    const response = await api.get<Blob>(
      `/analytics/events/${eventId}/export/`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },
};

export default analyticsService;
