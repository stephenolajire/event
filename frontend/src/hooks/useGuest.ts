import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import guestService, {
  type GuestListParams,
  type CreateGuestPayload,
  type UpdateGuestPayload,
} from "../services/guestService";

// Query Keys
export const guestKeys = {
  all: ["guests"] as const,
  lists: () => [...guestKeys.all, "list"] as const,
  list: (params?: GuestListParams) => [...guestKeys.lists(), params] as const,
  byEvent: (eventId: number) => [...guestKeys.all, "byEvent", eventId] as const,
  checkedIn: (eventId?: number) =>
    [...guestKeys.all, "checkedIn", eventId] as const,
  confirmed: (eventId?: number) =>
    [...guestKeys.all, "confirmed", eventId] as const,
  details: () => [...guestKeys.all, "detail"] as const,
  detail: (id: number) => [...guestKeys.details(), id] as const,
};

// Hook: Get All Guests
export const useGuests = (params?: GuestListParams) => {
  return useQuery({
    queryKey: guestKeys.list(params),
    queryFn: () => guestService.getGuests(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook: Get Guest by ID
export const useGuest = (id: number) => {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn: () => guestService.getGuestById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook: Get Guests by Event
export const useGuestsByEvent = (eventId: number) => {
  return useQuery({
    queryKey: guestKeys.byEvent(eventId),
    queryFn: () => guestService.getGuestsByEvent(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook: Get Checked-In Guests
export const useCheckedInGuests = (eventId?: number) => {
  return useQuery({
    queryKey: guestKeys.checkedIn(eventId),
    queryFn: () => guestService.getCheckedInGuests(eventId),
    staleTime: 30 * 1000, // 30 seconds (more frequent for live check-ins)
  });
};

// Hook: Get Confirmed Guests
export const useConfirmedGuests = (eventId?: number) => {
  return useQuery({
    queryKey: guestKeys.confirmed(eventId),
    queryFn: () => guestService.getConfirmedGuests(eventId),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook: Create Guest
export const useCreateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGuestPayload) =>
      guestService.createGuest(payload),
    onSuccess: (data) => {
      // Invalidate guest lists
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: guestKeys.byEvent(data.event),
      });
    },
    onError: (error: any) => {
      console.error("Create guest failed:", error);
    },
  });
};

// Hook: Update Guest (PUT)
export const useUpdateGuest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGuestPayload) =>
      guestService.updateGuest(id, payload),
    onMutate: async (newGuest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestKeys.detail(id) });

      // Snapshot the previous value
      const previousGuest = queryClient.getQueryData(guestKeys.detail(id));

      // Optimistically update to the new value
      if (previousGuest) {
        queryClient.setQueryData(guestKeys.detail(id), {
          ...previousGuest,
          ...newGuest,
        });
      }

      return { previousGuest };
    },
    onError: (error: any, context: any) => {
      // Rollback on error
      if (context?.previousGuest) {
        queryClient.setQueryData(guestKeys.detail(id), context.previousGuest);
      }
      console.error("Update guest failed:", error);
    },
    onSettled: (data) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      if (data?.event) {
        queryClient.invalidateQueries({
          queryKey: guestKeys.byEvent(data.event),
        });
      }
    },
  });
};

// Hook: Partial Update Guest (PATCH)
export const usePatchGuest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UpdateGuestPayload>) =>
      guestService.patchGuest(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      if (data?.event) {
        queryClient.invalidateQueries({
          queryKey: guestKeys.byEvent(data.event),
        });
        queryClient.invalidateQueries({
          queryKey: guestKeys.checkedIn(data.event),
        });
        queryClient.invalidateQueries({
          queryKey: guestKeys.confirmed(data.event),
        });
      }
    },
    onError: (error: any) => {
      console.error("Patch guest failed:", error);
    },
  });
};

// Hook: Delete Guest
export const useDeleteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => guestService.deleteGuest(id),
    onSuccess: () => {
      // Invalidate all guest queries
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
    onError: (error: any) => {
      console.error("Delete guest failed:", error);
    },
  });
};

// Hook: Bulk Delete Guests
export const useBulkDeleteGuests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => guestService.deleteGuest(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.all });
    },
    onError: (error: any) => {
      console.error("Bulk delete guests failed:", error);
    },
  });
};
