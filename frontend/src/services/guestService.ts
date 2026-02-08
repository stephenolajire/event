import api from "../constant/api";

// Types
export interface Guest {
  id: number;
  event: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  title?: string;
  notes?: string;
  plus_one_allowed: boolean;
  plus_one_name?: string;
  status: "pending" | "confirmed" | "declined";
  rsvp_status: boolean;
  rsvp_date?: string;
  has_checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  invitation_sent: boolean;
  invitation_sent_at?: string;
  qr_code?: QRCode;
  created_at: string;
  updated_at: string;
}

export interface GuestListItem {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  status: "pending" | "confirmed" | "declined";
  rsvp_status: boolean;
  has_checked_in: boolean;
  checked_in_at?: string;
  phone_number?:string;
  company:string;
  event:number;
}

export interface QRCode {
  id: number;
  guest: number;
  guest_name: string;
  event_title: string;
  token: string;
  qr_image: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGuestPayload {
  event: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  title?: string;
  notes?: string;
  plus_one_allowed?: boolean;
  plus_one_name?: string;
  status?: "pending" | "confirmed" | "declined";
  rsvp_status?: boolean;
  rsvp_date?: string;
}

export interface UpdateGuestPayload {
  event?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  company?: string;
  title?: string;
  notes?: string;
  plus_one_allowed?: boolean;
  plus_one_name?: string;
  status?: "pending" | "confirmed" | "declined";
  rsvp_status?: boolean;
  rsvp_date?: string;
}

export interface GuestListParams {
  event?: number;
  status?: "pending" | "confirmed" | "declined";
  rsvp_status?: boolean;
  has_checked_in?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedGuestResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GuestListItem[];
}

const guestService = {
  // Get all guests
  getGuests: async (
    params?: GuestListParams,
  ): Promise<PaginatedGuestResponse> => {
    const response = await api.get("/guests/", { params });
    return response.data;
  },

  // Get guest by ID
  getGuestById: async (id: number): Promise<Guest> => {
    const response = await api.get(`/guests/${id}/`);
    return response.data;
  },

  // Create guest
  createGuest: async (payload: CreateGuestPayload): Promise<Guest> => {
    const response = await api.post("/guests/", payload);
    return response.data;
  },

  // Update guest (PATCH)
  patchGuest: async (
    id: number,
    payload: Partial<UpdateGuestPayload>,
  ): Promise<Guest> => {
    const response = await api.patch(`/guests/${id}/`, payload);
    return response.data;
  },

  // Update guest (PUT)
  updateGuest: async (
    id: number,
    payload: UpdateGuestPayload,
  ): Promise<Guest> => {
    const response = await api.put(`/guests/${id}/`, payload);
    return response.data;
  },

  // Delete guest
  deleteGuest: async (id: number): Promise<void> => {
    await api.delete(`/guests/${id}/`);
  },

  // Get guests by event
  getGuestsByEvent: async (eventId: number): Promise<GuestListItem[]> => {
    const response = await api.get("/guests/", {
      params: { event: eventId },
    });
    return response.data;
  },

  // Get checked-in guests
  getCheckedInGuests: async (eventId?: number): Promise<GuestListItem[]> => {
    const response = await api.get("/guests/", {
      params: { has_checked_in: true, event: eventId },
    });
    return response.data;
  },

  // Get confirmed guests
  getConfirmedGuests: async (eventId?: number): Promise<GuestListItem[]> => {
    const response = await api.get("/guests/", {
      params: { status: "confirmed", event: eventId },
    });
    return response.data;
  },
};

export default guestService;
