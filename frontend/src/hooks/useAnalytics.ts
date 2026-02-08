import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import analyticsService from "../services/analyticService";
import type { DashboardStats, EventStats } from "../services/analyticService";


export const useDashboardStats = (
  options?: Omit<UseQueryOptions<DashboardStats>, "queryKey" | "queryFn">,
) => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsService.getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useEventStats = (
  eventId: number | undefined,
  options?: Omit<UseQueryOptions<EventStats>, "queryKey" | "queryFn">,
) => {
  return useQuery<EventStats>({
    queryKey: ["event-stats", eventId],
    queryFn: () => analyticsService.getEventStats(eventId!),
    enabled: !!eventId, // Only run if eventId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};


export const useExportGuestList = () => {
  return useMutation({
    mutationFn: (eventId: number) => analyticsService.exportGuestList(eventId),
    onSuccess: (blob: Blob, eventId: number) => {
      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `event-${eventId}-guests.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      console.error("Error exporting guest list:", error);
    },
  });
};


export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };
};

export const useRefreshEventStats = () => {
  const queryClient = useQueryClient();

  return (eventId: number) => {
    queryClient.invalidateQueries({ queryKey: ["event-stats", eventId] });
  };
};
