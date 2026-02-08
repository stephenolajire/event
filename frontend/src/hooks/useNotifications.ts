import { useMutation, useQueryClient } from "@tanstack/react-query";
import notificationService, {
  type SendInvitePayload,
  type SendBulkInvitesPayload,
  type SendEventReminderPayload,
} from "../services/notificationService";
import { guestKeys } from "./useGuest";

// Hook: Send Invitation to Single Guest
export const useSendInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendInvitePayload) =>
      notificationService.sendInvite(payload),
    onSuccess: (data, variables) => {
        console.log("Invite sent successfully:", data);
      // Invalidate guest details to update invitation_sent status
      queryClient.invalidateQueries({
        queryKey: guestKeys.detail(variables.guest_id),
      });
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Send invite failed:", error);
    },
  });
};

// Hook: Send Bulk Invitations
export const useSendBulkInvites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendBulkInvitesPayload) =>
      notificationService.sendBulkInvites(payload),
    onSuccess: (data, variables) => {
        console.log("Bulk invites sent successfully:", data);
      // Invalidate all guest queries since multiple guests were updated
      variables.guest_ids.forEach((guestId) => {
        queryClient.invalidateQueries({
          queryKey: guestKeys.detail(guestId),
        });
      });
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Send bulk invites failed:", error);
    },
  });
};

// Hook: Send Event Reminder
export const useSendEventReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendEventReminderPayload) =>
      notificationService.sendEventReminder(payload),
    onSuccess: (data, variables) => {
        console.log("Event reminder sent successfully:", data);
      // Invalidate guest lists for the event
      queryClient.invalidateQueries({
        queryKey: guestKeys.byEvent(variables.event_id),
      });
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Send event reminder failed:", error);
    },
  });
};
