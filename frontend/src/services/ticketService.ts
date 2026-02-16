import axiosInstance from "../constant/api";

// Types
export interface TicketBenefit {
  id?: number;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface TicketType {
  id: number;
  event: number;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  quantity_remaining: number;
  sale_start_date: string;
  sale_end_date: string;
  min_purchase: number;
  max_purchase: number;
  is_active: boolean;
  is_visible: boolean;
  is_available: boolean;
  sold_out: boolean;
  benefits: TicketBenefit[];
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  event: number;
  event_title?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  payment_reference: string;
  payment_date: string;
  notes: string;
  items: OrderItem[];
  total_tickets: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  ticket_type: number;
  ticket_type_name?: string;
  ticket_type_category?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  ticket_code: string;
  ticket_type: number;
  ticket_type_name?: string;
  event: number;
  event_title?: string;
  event_date?: string;
  event_location?: string;
  holder_name: string;
  holder_email: string;
  holder_phone: string;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  qr_code: string;
  created_at: string;
}

export interface DiscountCode {
  id: number;
  code: string;
  event: number | null;
  discount_type: string;
  discount_value: number;
  min_purchase_amount: number;
  max_uses: number | null;
  max_uses_per_user: number;
  times_used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  is_valid: boolean;
  applicable_ticket_types: number[];
  created_at: string;
}

export interface CreateTicketTypePayload {
  event: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity_available: number;
  sale_start_date: string;
  sale_end_date: string;
  min_purchase?: number;
  max_purchase?: number;
  is_active?: boolean;
  is_visible?: boolean;
  benefits?: TicketBenefit[];
}

export interface UpdateTicketTypePayload {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  quantity_available?: number;
  sale_start_date?: string;
  sale_end_date?: string;
  min_purchase?: number;
  max_purchase?: number;
  is_active?: boolean;
  is_visible?: boolean;
  benefits?: TicketBenefit[];
}

export interface CreateOrderPayload {
  event: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: Array<{
    ticket_type_id: number;
    quantity: number;
  }>;
  discount_code?: string;
}

export interface TicketListParams {
  event?: number;
  available?: boolean;
  page?: number;
  page_size?: number;
}

export interface OrderListParams {
  event?: number;
  status?: string;
  payment_status?: string;
  page?: number;
  page_size?: number;
}

export interface PublicTicketType {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  quantity_remaining: number;
  sale_start_date: string;
  sale_end_date: string;
  min_purchase: number;
  max_purchase: number;
  is_active: boolean;
  is_visible: boolean;
  is_available: boolean;
  sold_out: boolean;
  benefits: TicketBenefit[];
}

// Ticket Service
const ticketService = {
  // Ticket Types
  getTicketTypes: async (params?: TicketListParams): Promise<TicketType[]> => {
    const response = await axiosInstance.get("/ticket/ticket-types/", {
      params,
    });
    return response.data.results || response.data;
  },

  getTicketTypeById: async (id: number): Promise<TicketType> => {
    const response = await axiosInstance.get(`/ticket/ticket-types/${id}/`);
    return response.data;
  },

  createTicketType: async (
    payload: CreateTicketTypePayload,
  ): Promise<TicketType> => {
    const response = await axiosInstance.post("/ticket/ticket-types/", payload);
    return response.data;
  },

  updateTicketType: async (
    id: number,
    payload: UpdateTicketTypePayload,
  ): Promise<TicketType> => {
    const response = await axiosInstance.put(
      `/ticket/ticket-types/${id}/`,
      payload,
    );
    return response.data;
  },

  patchTicketType: async (
    id: number,
    payload: Partial<UpdateTicketTypePayload>,
  ): Promise<TicketType> => {
    const response = await axiosInstance.patch(
      `/ticket/ticket-types/${id}/`,
      payload,
    );
    return response.data;
  },

  deleteTicketType: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/ticket/ticket-types/${id}/`);
  },

  addBenefit: async (
    ticketTypeId: number,
    benefit: TicketBenefit,
  ): Promise<TicketType> => {
    const response = await axiosInstance.post(
      `/ticket/ticket-types/${ticketTypeId}/add_benefit/`,
      benefit,
    );
    return response.data;
  },

  // Orders
  getOrders: async (params?: OrderListParams): Promise<Order[]> => {
    const response = await axiosInstance.get("/ticket/orders/", { params });
    return response.data.results || response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await axiosInstance.get(`/ticket/orders/${id}/`);
    return response.data;
  },

  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await axiosInstance.post("/ticket/orders/", payload);
    return response.data;
  },

  confirmPayment: async (
    id: number,
    paymentData: {
      payment_method: string;
      payment_reference: string;
    },
  ): Promise<Order> => {
    const response = await axiosInstance.post(
      `/ticket/orders/${id}/confirm_payment/`,
      paymentData,
    );
    return response.data;
  },

  cancelOrder: async (id: number): Promise<Order> => {
    const response = await axiosInstance.post(`/ticket/orders/${id}/cancel/`);
    return response.data;
  },

  // Tickets
  getTickets: async (params?: {
    event?: number;
    email?: string;
    ticket_number?: string;
  }) => {
    const response = await axiosInstance.get("/ticket/tickets/", { params });
    return response.data.results || response.data;
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.get(`/ticket/tickets/${id}/`);
    return response.data;
  },

  checkInTicket: async (id: number): Promise<Ticket> => {
    const response = await axiosInstance.post(
      `/ticket/tickets/${id}/check_in/`,
    );
    return response.data;
  },

  // Discount Codes
  getDiscountCodes: async (): Promise<DiscountCode[]> => {
    const response = await axiosInstance.get("/ticket/discount-codes/");
    return response.data.results || response.data;
  },

  getDiscountCodeById: async (id: number): Promise<DiscountCode> => {
    const response = await axiosInstance.get(`/ticket/discount-codes/${id}/`);
    return response.data;
  },

  createDiscountCode: async (
    payload: Partial<DiscountCode>,
  ): Promise<DiscountCode> => {
    const response = await axiosInstance.post(
      "/ticket/discount-codes/",
      payload,
    );
    return response.data;
  },

  getPublicTicketTypes: async (eventId: number) => {
    const response = await axiosInstance.get(`/ticket/ticket-types/`, {
      params: {
        event: eventId,
        available: true,
      },
    });
    return response.data.results || response.data;
  },

  validateDiscountCode: async (data: {
    code: string;
    event_id: number;
    order_total: number;
  }): Promise<{
    valid: boolean;
    discount_type: string;
    discount_value: number;
    discount_amount: number;
  }> => {
    const response = await axiosInstance.post(
      "/ticket/discount-codes/validate_code/",
      data,
    );
    return response.data;
  },
};

export interface TicketBenefit {
  id?: number;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export default ticketService;
