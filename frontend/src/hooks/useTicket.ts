import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ticketService, {
  type TicketListParams,
  type OrderListParams,
  type CreateTicketTypePayload,
  type UpdateTicketTypePayload,
  type CreateOrderPayload,
  type TicketBenefit,
} from "../services/ticketService";

// Query Keys
export const ticketKeys = {
  all: ["tickets"] as const,
  types: () => [...ticketKeys.all, "types"] as const,
  typeList: (params?: TicketListParams) =>
    [...ticketKeys.types(), params] as const,
  typeDetail: (id: number) => [...ticketKeys.types(), id] as const,
  orders: () => [...ticketKeys.all, "orders"] as const,
  orderList: (params?: OrderListParams) =>
    [...ticketKeys.orders(), params] as const,
  orderDetail: (id: number) => [...ticketKeys.orders(), id] as const,
  tickets: () => [...ticketKeys.all, "tickets"] as const,
  ticketList: (params?: any) => [...ticketKeys.tickets(), params] as const,
  ticketDetail: (id: number) => [...ticketKeys.tickets(), id] as const,
  discountCodes: () => [...ticketKeys.all, "discount-codes"] as const,
  discountCodeDetail: (id: number) =>
    [...ticketKeys.discountCodes(), id] as const,
};

// ==================== TICKET TYPES ====================

// Hook: Get All Ticket Types
export const usePublicTicketTypes = (eventId: number | undefined) => {
  return useQuery({
    queryKey: ["tickets", "public", eventId],
    queryFn: () => {
      if (!eventId) throw new Error("Event ID is required");
      return ticketService.getPublicTicketTypes(eventId);
    },
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTicketTypes = (params?: TicketListParams) => {
  return useQuery({
    queryKey: ticketKeys.typeList(params),
    queryFn: () => ticketService.getTicketTypes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook: Get Ticket Type by ID
export const useTicketType = (id: number) => {
  return useQuery({
    queryKey: ticketKeys.typeDetail(id),
    queryFn: () => ticketService.getTicketTypeById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Hook: Create Ticket Type
export const useCreateTicketType = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateTicketTypePayload) =>
      ticketService.createTicketType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
      navigate("/ticket");
    },
    onError: (error: any) => {
      console.error("Create ticket type failed:", error);
    },
  });
};

// Hook: Update Ticket Type
export const useUpdateTicketType = (id: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: UpdateTicketTypePayload) =>
      ticketService.updateTicketType(id, payload),
    onMutate: async (newTicketType) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.typeDetail(id) });
      const previousTicketType = queryClient.getQueryData(
        ticketKeys.typeDetail(id),
      );

      if (previousTicketType) {
        queryClient.setQueryData(ticketKeys.typeDetail(id), {
          ...previousTicketType,
          ...newTicketType,
        });
      }

      return { previousTicketType };
    },
    onError: (error: any, _variables, context: any) => {
      if (context?.previousTicketType) {
        queryClient.setQueryData(
          ticketKeys.typeDetail(id),
          context.previousTicketType,
        );
      }
      console.error("Update ticket type failed:", error);
    },
    onSuccess: () => {
      navigate("/tickets");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.typeDetail(id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
    },
  });
};

// Hook: Partial Update Ticket Type (PATCH)
export const usePatchTicketType = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UpdateTicketTypePayload>) =>
      ticketService.patchTicketType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.typeDetail(id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
    },
    onError: (error: any) => {
      console.error("Patch ticket type failed:", error);
    },
  });
};

// Hook: Delete Ticket Type
export const useDeleteTicketType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketService.deleteTicketType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
    },
    onError: (error: any) => {
      console.error("Delete ticket type failed:", error);
    },
  });
};

// Hook: Add Benefit to Ticket Type
export const useAddBenefit = (ticketTypeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (benefit: TicketBenefit) =>
      ticketService.addBenefit(ticketTypeId, benefit),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.typeDetail(ticketTypeId),
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
    },
    onError: (error: any) => {
      console.error("Add benefit failed:", error);
    },
  });
};

// ==================== ORDERS ====================

// Hook: Get All Orders
export const useOrders = (params?: OrderListParams) => {
  return useQuery({
    queryKey: ticketKeys.orderList(params),
    queryFn: () => ticketService.getOrders(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook: Get Order by ID
export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ticketKeys.orderDetail(id),
    queryFn: () => ticketService.getOrderById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

// Hook: Create Order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      ticketService.createOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.tickets() });
      // Navigate to payment or success page
      navigate(`/payment-success?order=${data.order_number}`);
    },
    onError: (error: any) => {
      console.error("Create order failed:", error);
    },
  });
};

// Hook: Confirm Payment
export const useConfirmPayment = (orderId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData: {
      payment_method: string;
      payment_reference: string;
    }) => ticketService.confirmPayment(orderId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.orderDetail(orderId),
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.tickets() });
    },
    onError: (error: any) => {
      console.error("Confirm payment failed:", error);
    },
  });
};

// Hook: Cancel Order
export const useCancelOrder = (orderId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.orderDetail(orderId),
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.orders() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
    },
    onError: (error: any) => {
      console.error("Cancel order failed:", error);
    },
  });
};

// ==================== TICKETS ====================

// Hook: Get All Tickets
export const useTickets = (params?: {
  event?: number;
  email?: string;
  ticket_number?: string;
}) => {
  return useQuery({
    queryKey: ticketKeys.ticketList(params),
    queryFn: () => ticketService.getTickets(params),
    staleTime: 1 * 60 * 1000,
  });
};

// Hook: Get Ticket by ID
export const useTicket = (id: number) => {
  return useQuery({
    queryKey: ticketKeys.ticketDetail(id),
    queryFn: () => ticketService.getTicketById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

// Hook: Check In Ticket
export const useCheckInTicket = (ticketId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticketService.checkInTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketKeys.ticketDetail(ticketId),
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.tickets() });
    },
    onError: (error: any) => {
      console.error("Check-in ticket failed:", error);
    },
  });
};

// ==================== DISCOUNT CODES ====================

// Hook: Get All Discount Codes
export const useDiscountCodes = () => {
  return useQuery({
    queryKey: ticketKeys.discountCodes(),
    queryFn: ticketService.getDiscountCodes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook: Get Discount Code by ID
export const useDiscountCode = (id: number) => {
  return useQuery({
    queryKey: ticketKeys.discountCodeDetail(id),
    queryFn: () => ticketService.getDiscountCodeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook: Create Discount Code
export const useCreateDiscountCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => ticketService.createDiscountCode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.discountCodes() });
    },
    onError: (error: any) => {
      console.error("Create discount code failed:", error);
    },
  });
};

// Hook: Validate Discount Code
export const useValidateDiscountCode = () => {
  return useMutation({
    mutationFn: (data: {
      code: string;
      event_id: number;
      order_total: number;
    }) => ticketService.validateDiscountCode(data),
    onError: (error: any) => {
      console.error("Validate discount code failed:", error);
    },
  });
};

// ==================== UTILITY HOOKS ====================

// Hook: Refresh Ticket Types
export const useRefreshTicketTypes = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ticketKeys.types() });
  };
};

// Hook: Refresh Orders
export const useRefreshOrders = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ticketKeys.orders() });
  };
};

// Hook: Refresh Tickets
export const useRefreshTickets = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ticketKeys.tickets() });
  };
};
