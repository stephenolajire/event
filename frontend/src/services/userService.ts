import axiosInstance from "../constant/api";

// Types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: "customer" | "organizer";
  organization?: string; // Optional - only required for organizers
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  organization?: string;
  profile_picture?: File; // File for upload
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password2: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  organization?: string;
  profile_picture?: string; // URL string from backend
  user_type: "customer" | "organizer";
  is_customer: boolean;
  is_organizer: boolean;
  total_events?: number;
  total_guests?: number;
  total_tickets_purchased?: number;
  total_orders?: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    user_type: "customer" | "organizer";
    is_customer: boolean;
    is_organizer: boolean;
    organization?: string;
  };
}

export interface RegisterResponse {
  user: UserProfile;
  message: string;
}

// User Service
const userService = {
  // Login
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post("/accounts/login/", payload);

    // Store tokens in localStorage
    if (response.data.access) {
      localStorage.setItem("authToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
    }

    return response.data;
  },

  // Register
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const response = await axiosInstance.post("/accounts/register/", payload);
    return response.data;
  },

  // Get Profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get("/accounts/profile/");
    return response.data;
  },

  // Update Profile
  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UserProfile> => {
    // If profile_picture is a File, use FormData
    if (payload.profile_picture instanceof File) {
      const formData = new FormData();

      // Only append non-file fields that are defined
      if (payload.first_name) formData.append("first_name", payload.first_name);
      if (payload.last_name) formData.append("last_name", payload.last_name);
      if (payload.phone_number)
        formData.append("phone_number", payload.phone_number);
      if (payload.organization)
        formData.append("organization", payload.organization);

      // Append the file
      formData.append("profile_picture", payload.profile_picture);

      const response = await axiosInstance.patch(
        "/accounts/profile/update/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    }

    // Otherwise, send as JSON (without profile_picture)
    const { profile_picture, ...jsonPayload } = payload;
    const response = await axiosInstance.patch(
      "/accounts/profile/update/",
      jsonPayload,
    );
    return response.data;
  },

  // Change Password
  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.post(
      "/accounts/change-password/",
      payload,
    );
    return response.data;
  },

  // Delete Account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.delete("/accounts/delete/");

    // Clear tokens on account deletion
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");

    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  },

  // Refresh Token
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await axiosInstance.post("/accounts/token/refresh/", {
      refresh,
    });

    // Update access token
    if (response.data.access) {
      localStorage.setItem("authToken", response.data.access);
    }

    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("authToken");
  },

  // Get stored tokens
  getTokens: () => {
    return {
      access: localStorage.getItem("authToken"),
      refresh: localStorage.getItem("refreshToken"),
    };
  },
};

export default userService;
