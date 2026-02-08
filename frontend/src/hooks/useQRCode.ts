import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import qrCodeService, {
  type QRCodeListParams,
  type CreateQRCodePayload,
  type GenerateQRCodePayload,
  type ValidateQRCodePayload,
} from "../services/qrCodeService";

// Query Keys
export const qrCodeKeys = {
  all: ["qrCodes"] as const,
  lists: () => [...qrCodeKeys.all, "list"] as const,
  list: (params?: QRCodeListParams) => [...qrCodeKeys.lists(), params] as const,
  byGuest: (guestId: number) =>
    [...qrCodeKeys.all, "byGuest", guestId] as const,
  unused: (eventId?: number) => [...qrCodeKeys.all, "unused", eventId] as const,
  used: (eventId?: number) => [...qrCodeKeys.all, "used", eventId] as const,
  details: () => [...qrCodeKeys.all, "detail"] as const,
  detail: (id: number) => [...qrCodeKeys.details(), id] as const,
};

// Hook: Get All QR Codes
export const useQRCodes = (params?: QRCodeListParams) => {
  return useQuery({
    queryKey: qrCodeKeys.list(params),
    queryFn: () => qrCodeService.getQRCodes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook: Get QR Code by ID
export const useQRCode = (id: number) => {
  return useQuery({
    queryKey: qrCodeKeys.detail(id),
    queryFn: () => qrCodeService.getQRCodeById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook: Get QR Code by Guest ID
export const useQRCodeByGuest = (guestId: number) => {
  return useQuery({
    queryKey: qrCodeKeys.byGuest(guestId),
    queryFn: () => qrCodeService.getQRCodeByGuest(guestId),
    enabled: !!guestId,
    staleTime: 1 * 60 * 1000,
  });
};

// Hook: Get Unused QR Codes
export const useUnusedQRCodes = (eventId?: number) => {
  return useQuery({
    queryKey: qrCodeKeys.unused(eventId),
    queryFn: () => qrCodeService.getUnusedQRCodes(eventId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook: Get Used QR Codes
export const useUsedQRCodes = (eventId?: number) => {
  return useQuery({
    queryKey: qrCodeKeys.used(eventId),
    queryFn: () => qrCodeService.getUsedQRCodes(eventId),
    staleTime: 1 * 60 * 1000,
  });
};

// Hook: Create QR Code
export const useCreateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQRCodePayload) =>
      qrCodeService.createQRCode(payload),
    onSuccess: (data) => {
      // Invalidate QR code lists
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: qrCodeKeys.byGuest(data.guest),
      });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.unused() });
    },
    onError: (error: any) => {
      console.error("Create QR code failed:", error);
    },
  });
};

// Hook: Generate QR Code
export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateQRCodePayload) =>
      qrCodeService.generateQRCode(payload),
    onSuccess: (data) => {
      // Invalidate QR code lists and guest-specific data
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: qrCodeKeys.byGuest(data.guest),
      });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.unused() });
      // Also invalidate guest details since QR code is part of guest data
      queryClient.invalidateQueries({
        queryKey: ["guests", "detail", data.guest],
      });
    },
    onError: (error: any) => {
      console.error("Generate QR code failed:", error);
    },
  });
};

// Hook: Validate QR Code
export const useValidateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ValidateQRCodePayload) =>
      qrCodeService.validateQRCode(payload),
    onSuccess: (data) => {
      // If validation was successful and QR code is now used, invalidate related queries
      if (data.valid && data.qr_code) {
        queryClient.invalidateQueries({
          queryKey: qrCodeKeys.detail(data.qr_code.id),
        });
        queryClient.invalidateQueries({
          queryKey: qrCodeKeys.byGuest(data.qr_code.guest),
        });
        queryClient.invalidateQueries({ queryKey: qrCodeKeys.unused() });
        queryClient.invalidateQueries({ queryKey: qrCodeKeys.used() });
        // Invalidate guest data if check-in status changed
        if (data.guest) {
          queryClient.invalidateQueries({
            queryKey: ["guests", "detail", data.guest.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["guests", "checkedIn"],
          });
        }
      }
    },
    onError: (error: any) => {
      console.error("Validate QR code failed:", error);
    },
  });
};

// Hook: Update QR Code (PATCH)
export const usePatchQRCode = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateQRCodePayload>) =>
      qrCodeService.patchQRCode(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: qrCodeKeys.byGuest(data.guest),
      });
      if (data.is_used) {
        queryClient.invalidateQueries({ queryKey: qrCodeKeys.unused() });
        queryClient.invalidateQueries({ queryKey: qrCodeKeys.used() });
      }
    },
    onError: (error: any) => {
      console.error("Patch QR code failed:", error);
    },
  });
};

// Hook: Delete QR Code
export const useDeleteQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => qrCodeService.deleteQRCode(id),
    onSuccess: () => {
      // Invalidate all QR code queries
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.all });
    },
    onError: (error: any) => {
      console.error("Delete QR code failed:", error);
    },
  });
};

// Hook: Bulk Generate QR Codes
export const useBulkGenerateQRCodes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestIds: number[]) =>
      qrCodeService.bulkGenerateQRCodes(guestIds),
    onSuccess: () => {
      // Invalidate all QR code and guest queries
      queryClient.invalidateQueries({ queryKey: qrCodeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["guests"] });
    },
    onError: (error: any) => {
      console.error("Bulk generate QR codes failed:", error);
    },
  });
};
