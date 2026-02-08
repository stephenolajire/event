import api from "../constant/api";

// Types
export interface SendInvitePayload {
  guest_id: number;
}

export interface SendBulkInvitesPayload {
  guest_ids: number[];
}

export interface SendEventReminderPayload {
  event_id: number;
}

export interface EmailResponse {
  message: string;
}

const notificationService = {
  // Send invitation to a single guest
  sendInvite: async (payload: SendInvitePayload): Promise<EmailResponse> => {
    const response = await api.post("/notifications/send-invite/", payload);
    return response.data;
  },

  // Send invitations to multiple guests
  sendBulkInvites: async (
    payload: SendBulkInvitesPayload,
  ): Promise<EmailResponse> => {
    const response = await api.post(
      "/notifications/send-bulk-invites/",
      payload,
    );
    return response.data;
  },

  // Send reminder to all confirmed guests of an event
  sendEventReminder: async (
    payload: SendEventReminderPayload,
  ): Promise<EmailResponse> => {
    const response = await api.post(
      "/notifications/send-event-reminder/",
      payload,
    );
    return response.data;
  },
};

export default notificationService;
