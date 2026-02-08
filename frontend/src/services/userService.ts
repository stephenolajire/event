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
  organization: string;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  phone_number: string;
  organization: string;
  profile_picture?: string;
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
  organization: string;
  profile_picture: string;
  total_events: number;
  total_guests: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// User Service
const userService = {
  // Login
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/accounts/login/", payload);
    return response.data;
  },

  // Register
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
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
    const response = await axiosInstance.put(
      "/accounts/profile/update/",
      payload,
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
    return response.data;
  },
};

export default userService;
