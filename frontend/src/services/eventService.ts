import axiosInstance from "../constant/api";

// Types
export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "completed"
  | "upcoming"
  | "past";

export interface EventListItem {
  id: number;
  title: string;
  event_date: string;
  location: string;
  venue_name: string;
  status: EventStatus;
  organizer_name: string;
  total_guests: number;
  checked_in_count: number;
  attendance_rate: number;
  banner_image: string;
  created_at: string;
  slug: string;
  ticket_purchase_link: string;
  has_tickets: boolean;
}

export interface OrganizerDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  organization: string;
  profile_picture: string;
  total_events: number;
  total_guests: number;
  created_at: string;
  updated_at: string;
}

export interface EventDetail {
  id: number;
  organizer: number;
  organizer_details: OrganizerDetails;
  title: string;
  description: string;
  event_date: string;
  event_end_date: string;
  location: string;
  venue_name: string;
  address: string;
  banner_image: string;
  capacity: number;
  allow_plus_one: boolean;
  require_rsvp: boolean;
  enable_self_checkin: boolean;
  checkin_start_time: string;
  checkin_end_time: string;
  status: EventStatus;
  is_public: boolean;
  total_guests: number;
  checked_in_count: number;
  pending_count: number;
  attendance_rate: number;
  is_at_capacity: boolean;
  available_slots: number;
  created_at: string;
  updated_at: string;
  slug:string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  event_date: string;
  event_end_date: string;
  location: string;
  venue_name: string;
  address: string;
  banner_image?: string;
  capacity: number;
  allow_plus_one?: boolean;
  require_rsvp?: boolean;
  enable_self_checkin?: boolean;
  checkin_start_time?: string;
  checkin_end_time?: string;
  status?: EventStatus;
  is_public?: boolean;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  event_date?: string;
  event_end_date?: string;
  location?: string;
  venue_name?: string;
  address?: string;
  banner_image?: string;
  capacity?: number;
  allow_plus_one?: boolean;
  require_rsvp?: boolean;
  enable_self_checkin?: boolean;
  checkin_start_time?: string;
  checkin_end_time?: string;
  status?: EventStatus;
  is_public?: boolean;
}

export interface EventStats {
  total_guests: number;
  checked_in_count: number;
  pending_count: number;
  attendance_rate: number;
  is_at_capacity: boolean;
  available_slots: number;
  guest_distribution?: {
    confirmed: number;
    pending: number;
    declined: number;
  };
  check_in_timeline?: Array<{
    time: string;
    count: number;
  }>;
}

export interface EventListParams {
  ordering?: string;
  search?: string;
  status?: EventStatus;
  page?: number;
  page_size?: number;
}

// Event Service
const eventService = {
  // Get all events
  getEvents: async (params?: EventListParams): Promise<EventListItem[]> => {
    const response = await axiosInstance.get("/events/", { params });
    return response.data.results || response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async (): Promise<EventDetail[]> => {
    const response = await axiosInstance.get("/events/upcoming/");
    return response.data;
  },

  // Get past events
  getPastEvents: async (): Promise<EventDetail[]> => {
    const response = await axiosInstance.get("/events/past/");
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: number): Promise<EventDetail> => {
    const response = await axiosInstance.get(`/events/${id}/`);
    return response.data;
  },

  // Create event - Now accepts both FormData and CreateEventPayload
  createEvent: async (
    payload: CreateEventPayload | FormData,
  ): Promise<EventDetail> => {
    const response = await axiosInstance.post("/events/", payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });
    return response.data;
  },

  getEventBySlug: async (slug: string) => {
    const response = await axiosInstance.get(`/events/by-slug/${slug}/`);
    return response.data;
  },

  // Update event - Now accepts both FormData and UpdateEventPayload
  updateEvent: async (
    id: number,
    payload: UpdateEventPayload | FormData,
  ): Promise<EventDetail> => {
    const response = await axiosInstance.put(`/events/${id}/`, payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // Partial update event - Now accepts both FormData and Partial<UpdateEventPayload>
  patchEvent: async (
    id: number,
    payload: Partial<UpdateEventPayload> | FormData,
  ): Promise<EventDetail> => {
    const response = await axiosInstance.patch(`/events/${id}/`, payload, {
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/events/${id}/`);
  },

  // Publish event
  publishEvent: async (id: number): Promise<EventDetail> => {
    const response = await axiosInstance.post(`/events/${id}/publish/`);
    return response.data;
  },

  // Cancel event
  cancelEvent: async (id: number): Promise<EventDetail> => {
    const response = await axiosInstance.post(`/events/${id}/cancel/`);
    return response.data;
  },

  // Get event statistics
  getEventStats: async (id: number): Promise<EventStats> => {
    const response = await axiosInstance.get(`/events/${id}/stats/`);
    return response.data;
  },
};

export default eventService;
