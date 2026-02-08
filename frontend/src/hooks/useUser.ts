import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userService, {
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
  type UserProfile,
} from "../services/userService";

// Query Keys
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};

// Hook: Get User Profile
export const useUserProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    enabled: isAuthenticated, // Only fetch if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook: Login
export const useLogin = () => {
  const { checkAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => userService.login(payload),
    onSuccess: (data:any) => {
      // Store token
    //   console.log("Login successful, token:", data);
      localStorage.setItem("authToken", data.access);

      // Update auth state
      checkAuth();

      // Set user profile in cache
      queryClient.setQueryData(userKeys.profile(), data.user);
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};

// Hook: Register
export const useRegister = () => {
  const { checkAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => userService.register(payload),
    onSuccess: (data:any) => {
      // Store token
      console.log("Registration successful:", data);
      localStorage.setItem("authToken", data.token);

      // Update auth state
      checkAuth();

      // Set user profile in cache
      queryClient.setQueryData(userKeys.profile(), data.user);
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
    },
  });
};

// Hook: Update Profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      userService.updateProfile(payload),
    onMutate: async (newProfile: UpdateProfilePayload) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(
        userKeys.profile(),
      );

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(userKeys.profile(), {
          ...previousProfile,
          ...newProfile,
        });
      }

      // Return context with the snapshot
      return { previousProfile };
    },
    onError: (error:any, context:any) => {
      // Rollback to the previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.profile(), context.previousProfile);
      }
      console.error("Update profile failed:", error);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

// Hook: Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      userService.changePassword(payload),
    onSuccess: (data:any) => {
      console.log("Password changed successfully:", data.message);
    },
    onError: (error: any) => {
      console.error("Change password failed:", error);
    },
  });
};

// Hook: Delete Account
export const useDeleteAccount = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteAccount,
    onSuccess: () => {
      // Remove token
      localStorage.removeItem("authToken");

      // Update auth state
      checkAuth();

      // Clear all queries
      queryClient.clear();

      // Navigate to login
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Delete account failed:", error);
    },
  });
};

// Hook: Logout (not an API call, but useful to have)
export const useLogout = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    // Remove token
    localStorage.removeItem("authToken");

    // Update auth state
    checkAuth();

    // Clear all queries
    queryClient.clear();

    // Navigate to login
    navigate("/");
  };

  return { logout };
};
