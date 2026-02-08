import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Trash2,
  AlertCircle,
  Users,
  CalendarDays,
  Loader2,
} from "lucide-react";
import AOS from "aos";
import {
  useUserProfile,
  useUpdateProfile,
  useDeleteAccount,
} from "../hooks/useUser";
import { toast } from "react-toastify";
import type { UpdateProfilePayload } from "../services/userService";

// Validation Schema
const profileSchema = yup.object().shape({
  first_name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Please enter a valid phone number",
    ),
  organization: yup.string().required("Organization is required"),
});

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  organization: string;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { data: profile, isLoading: isLoadingProfile } = useUserProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone_number: profile?.phone_number || "",
      organization: profile?.organization || "",
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        organization: profile.organization,
      });
      if (profile.profile_picture) {
        setProfileImage(profile.profile_picture);
      }
    }
  }, [profile, reset]);

  console.log("Profile data:", profile);

  const onSubmit = (data: ProfileFormData) => {
    const payload: UpdateProfilePayload = {
      ...data,
      ...(profileImage && { profile_picture: profileImage }),
    };

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        setIsEditing(false);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update profile. Please try again.";

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        toast.success("Account deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete account. Please try again.";

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
        setShowDeleteModal(false);
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <Loader2
            size={48}
            className="text-primary-600 animate-spin mx-auto mb-4"
          />
          <p className="text-primary-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-light text-lg mb-2">Failed to load profile</p>
          <p className="text-primary-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light mb-2">
            Profile
          </h1>
          <p className="text-sm sm:text-base text-primary-300">
            Manage your account information
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 text-sm"
          >
            <Lock size={18} />
            Change Password
          </Link>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-light rounded-lg font-semibold transition-all hover:scale-105 shadow-lg text-sm"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-aos="fade-up">
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <CalendarDays size={20} className="text-primary-400" />
            </div>
            <p className="text-primary-400 text-sm">Total Events</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {profile.total_events}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Users size={20} className="text-green-400" />
            </div>
            <p className="text-green-400 text-sm">Total Guests</p>
          </div>
          <p className="font-heading text-2xl font-bold text-light">
            {profile.total_guests}
          </p>
        </div>
        <div className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Calendar size={20} className="text-blue-400" />
            </div>
            <p className="text-blue-400 text-sm">Member Since</p>
          </div>
          <p className="font-heading text-lg font-bold text-light">
            {formatDate(profile.created_at).split(",")[0]}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 sm:p-8"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-primary-900">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center font-bold text-light text-3xl sm:text-4xl overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {profile.first_name[0]}
                    {profile.last_name[0]}
                  </span>
                )}
              </div>
              {isEditing && (
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 rounded-full cursor-pointer transition-colors"
                >
                  <Camera size={18} className="text-light" />
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-heading text-2xl font-bold text-light mb-1">
                {profile.full_name}
              </h2>
              <p className="text-primary-300 mb-2">{profile.email}</p>
              <p className="text-sm text-primary-500">
                Last updated: {formatDate(profile.updated_at)}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="w-full">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                First Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  id="first_name"
                  disabled={!isEditing}
                  placeholder="Enter your first name"
                  className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                    errors.first_name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  {...register("first_name")}
                />
              </div>
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.first_name.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="w-full">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Last Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  id="last_name"
                  disabled={!isEditing}
                  placeholder="Enter your last name"
                  className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                    errors.last_name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  {...register("last_name")}
                />
              </div>
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.last_name.message}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  disabled
                  value={profile.email}
                  className="w-full pl-12 pr-4 py-3 bg-dark border border-primary-800 rounded-lg text-light opacity-60 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-primary-500">
                Email cannot be changed
              </p>
            </div>

            {/* Phone Number */}
            <div className="w-full">
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <Phone size={20} />
                </div>
                <input
                  type="tel"
                  id="phone_number"
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                  className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                    errors.phone_number
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  {...register("phone_number")}
                />
              </div>
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Organization */}
            <div className="w-full sm:col-span-2">
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Organization
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <Building size={20} />
                </div>
                <input
                  type="text"
                  id="organization"
                  disabled={!isEditing}
                  placeholder="Enter your organization"
                  className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                    errors.organization
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                  {...register("organization")}
                />
              </div>
              {errors.organization && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.organization.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-primary-900">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 sm:flex-initial px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-light rounded-lg font-semibold transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      <div
        className="bg-linear-to-br from-red-900/10 to-red-800/5 border border-red-900/50 rounded-xl p-6"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <h3 className="font-heading text-lg font-bold text-light mb-2 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-400" />
          Danger Zone
        </h3>
        <p className="text-sm text-primary-300 mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-2.5 bg-red-900/20 border border-red-800 hover:bg-red-900/30 hover:border-red-600 text-red-400 rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <Trash2 size={18} />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className="bg-dark border border-red-900 rounded-xl p-6 max-w-md w-full"
            data-aos="zoom-in"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-900/30 rounded-full">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <h3 className="font-heading text-xl font-bold text-light">
                Delete Account?
              </h3>
            </div>
            <p className="text-primary-300 mb-6">
              Are you absolutely sure you want to delete your account? This
              action cannot be undone. All your events, guests, and data will be
              permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-light rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Yes, Delete
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
