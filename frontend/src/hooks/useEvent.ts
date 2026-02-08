import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import eventService, {
  type EventListParams,
  type CreateEventPayload,
  type UpdateEventPayload,
} from "../services/eventService";

// Query Keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params?: EventListParams) => [...eventKeys.lists(), params] as const,
  upcoming: () => [...eventKeys.all, "upcoming"] as const,
  past: () => [...eventKeys.all, "past"] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
  stats: (id: number) => [...eventKeys.detail(id), "stats"] as const,
};

// Hook: Get All Events
export const useEvents = (params?: EventListParams) => {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: () => eventService.getEvents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook: Get Upcoming Events
export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: eventKeys.upcoming(),
    queryFn: eventService.getUpcomingEvents,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook: Get Past Events
export const usePastEvents = () => {
  return useQuery({
    queryKey: eventKeys.past(),
    queryFn: eventService.getPastEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook: Get Event by ID
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook: Get Event Stats
export const useEventStats = (id: number) => {
  return useQuery({
    queryKey: eventKeys.stats(id),
    queryFn: () => eventService.getEventStats(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook: Create Event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      eventService.createEvent(payload),
    onSuccess: (data) => {
      // Invalidate events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });

      // Navigate to the new event
      navigate(`/dashboard/events/${data.id}`);
    },
    onError: (error: any) => {
      console.error("Create event failed:", error);
    },
  });
};

// Hook: Update Event
export const useUpdateEvent = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventPayload) =>
      eventService.updateEvent(id, payload),
    onMutate: async (newEvent) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) });

      // Snapshot the previous value
      const previousEvent = queryClient.getQueryData(eventKeys.detail(id));

      // Optimistically update to the new value
      if (previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), {
          ...previousEvent,
          ...newEvent,
        });
      }

      return { previousEvent };
    },
    onError: (error: any, context: any) => {
      // Rollback on error
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), context.previousEvent);
      }
      console.error("Update event failed:", error);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: eventKeys.past() });
    },
  });
};

// Hook: Partial Update Event (PATCH)
export const usePatchEvent = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UpdateEventPayload>) =>
      eventService.patchEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Patch event failed:", error);
    },
  });
};

// Hook: Delete Event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: eventKeys.all });

      // Navigate to events list
      navigate("/dashboard/events");
    },
    onError: (error: any) => {
      console.error("Delete event failed:", error);
    },
  });
};

// Hook: Publish Event
export const usePublishEvent = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventService.publishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
    },
    onError: (error: any) => {
      console.error("Publish event failed:", error);
    },
  });
};

// Hook: Cancel Event
export const useCancelEvent = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventService.cancelEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: eventKeys.past() });
    },
    onError: (error: any) => {
      console.error("Cancel event failed:", error);
    },
  });
};
