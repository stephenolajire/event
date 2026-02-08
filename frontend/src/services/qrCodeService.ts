import api from "../constant/api";

// Types
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

export interface CreateQRCodePayload {
  guest: number;
}

export interface GenerateQRCodePayload {
  guest_id: number;
}

export interface ValidateQRCodePayload {
  token: string;
}

export interface ValidateQRCodeResponse {
  valid: boolean;
  error?: string;
  guest?: {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    company?: string;
    has_checked_in: boolean;
    checked_in_at?: string;
  };
  event?: {
    id: number;
    title: string;
    event_date: string;
    location: string;
    venue_name: string;
  };
  qr_code?: {
    is_used: boolean;
    used_at?: string;
  };
}

export interface CheckInPayload {
  token: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  guest: {
    id: number;
    full_name: string;
    email: string;
    checked_in_at: string;
  };
  checkin: any;
}

export interface QRCodeListParams {
  guest?: number;
  is_used?: boolean;
  event?: number;
  search?: string;
  page?: number;
  page_size?: number;
}

const qrCodeService = {
  // Get all QR codes
  getQRCodes: async (params?: QRCodeListParams): Promise<QRCode[]> => {
    const response = await api.get("/qr-codes/", { params });
    return response.data;
  },

  // Get QR code by ID
  getQRCodeById: async (id: number): Promise<QRCode> => {
    const response = await api.get(`/qr-codes/${id}/`);
    return response.data;
  },

  // Create QR code
  createQRCode: async (payload: CreateQRCodePayload): Promise<QRCode> => {
    const response = await api.post("/qr-codes/", payload);
    return response.data;
  },

  // Generate QR code for a guest
  generateQRCode: async (payload: GenerateQRCodePayload): Promise<QRCode> => {
    const response = await api.post("/qr-codes/generate/", payload);
    return response.data;
  },

  // Validate QR code token (without checking in)
  validateQRCode: async (
    payload: ValidateQRCodePayload,
  ): Promise<ValidateQRCodeResponse> => {
    const response = await api.post("/checkin/validate_qr/", payload);
    return response.data;
  },

  // Check in guest using QR code token
  checkInGuest: async (payload: CheckInPayload): Promise<CheckInResponse> => {
    const response = await api.post("/checkin/checkin/", payload);
    return response.data;
  },

  // Update QR code (PATCH)
  patchQRCode: async (
    id: number,
    payload: Partial<QRCode>,
  ): Promise<QRCode> => {
    const response = await api.patch(`/qr-codes/${id}/`, payload);
    return response.data;
  },

  // Delete QR code
  deleteQRCode: async (id: number): Promise<void> => {
    await api.delete(`/qr-codes/${id}/`);
  },

  // Get QR code by guest ID
  getQRCodeByGuest: async (guestId: number): Promise<QRCode | null> => {
    const response = await api.get("/qr-codes/", {
      params: { guest: guestId },
    });
    return response.data.length > 0 ? response.data[0] : null;
  },

  // Get unused QR codes
  getUnusedQRCodes: async (eventId?: number): Promise<QRCode[]> => {
    const response = await api.get("/qr-codes/", {
      params: { is_used: false, event: eventId },
    });
    return response.data;
  },

  // Get used QR codes
  getUsedQRCodes: async (eventId?: number): Promise<QRCode[]> => {
    const response = await api.get("/qr-codes/", {
      params: { is_used: true, event: eventId },
    });
    return response.data;
  },

  // Bulk generate QR codes for multiple guests
  bulkGenerateQRCodes: async (guestIds: number[]): Promise<QRCode[]> => {
    const promises = guestIds.map((guest_id) =>
      qrCodeService.generateQRCode({ guest_id }),
    );
    return Promise.all(promises);
  },
};

export default qrCodeService;
