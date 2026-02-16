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
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => userService.login(payload),
    onSuccess: (data) => {
      // Store tokens
      console.log("Login successful:", data);
      localStorage.setItem("authToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Update auth state
      checkAuth();

      // Set user profile in cache
      queryClient.setQueryData(userKeys.profile(), data.user);

      // Navigate based on user type
      if (data.user.is_organizer) {
        navigate("/dashboard");
      } else {
        navigate("/events"); // Customers go to events page
      }
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};

// Hook: Register
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => userService.register(payload),
    onSuccess: (data) => {
      console.log("Registration successful:", data);

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

      // Optimistically update ONLY for non-file updates
      if (previousProfile && !(newProfile.profile_picture instanceof File)) {
        // Only update fields that are strings, not Files
        const optimisticUpdate: Partial<UserProfile> = {};

        if (newProfile.first_name)
          optimisticUpdate.first_name = newProfile.first_name;
        if (newProfile.last_name)
          optimisticUpdate.last_name = newProfile.last_name;
        if (newProfile.phone_number)
          optimisticUpdate.phone_number = newProfile.phone_number;
        if (newProfile.organization)
          optimisticUpdate.organization = newProfile.organization;

        queryClient.setQueryData<UserProfile>(userKeys.profile(), {
          ...previousProfile,
          ...optimisticUpdate,
        });
      }

      // Return context with the snapshot
      return { previousProfile };
    },
    onError: (error: any, _variables, context: any) => {
      // Rollback to the previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(userKeys.profile(), context.previousProfile);
      }
      console.error("Update profile failed:", error);
    },
    onSuccess: (data) => {
      // Set the actual response data (which will have the profile_picture URL if uploaded)
      queryClient.setQueryData(userKeys.profile(), data);
    },
    onSettled: () => {
      // Refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

// Hook: Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      userService.changePassword(payload),
    onSuccess: (data) => {
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
      // Remove tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

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
    // Remove tokens
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");

    // Update auth state
    checkAuth();

    // Clear all queries
    queryClient.clear();

    // Navigate to home
    navigate("/");
  };

  return { logout };
};

// Hook: Check if user is organizer
export const useIsOrganizer = () => {
  const { data: user } = useUserProfile();
  return user?.is_organizer ?? false;
};

// Hook: Check if user is customer
export const useIsCustomer = () => {
  const { data: user } = useUserProfile();
  return user?.is_customer ?? false;
};

// Hook: Get user type
export const useUserType = () => {
  const { data: user } = useUserProfile();
  return {
    userType: user?.user_type,
    isOrganizer: user?.is_organizer ?? false,
    isCustomer: user?.is_customer ?? false,
  };
};
