import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";
import AOS from "aos";
import { useChangePassword } from "../hooks/useUser";
import { toast } from "react-toastify";

// Validation Schema
const changePasswordSchema = yup.object().shape({
  old_password: yup
    .string()
    .required("Current password is required")
    .min(8, "Password must be at least 8 characters"),
  new_password: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .notOneOf(
      [yup.ref("old_password")],
      "New password must be different from current password",
    ),
  new_password2: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your new password"),
});

interface ChangePasswordFormData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: changePassword, isPending } = useChangePassword();

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
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        toast.success("Password changed successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
        reset();
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.data?.old_password?.[0] ||
          error?.response?.data?.new_password?.[0] ||
          "Failed to change password. Please try again.";

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light mb-2">
            Change Password
          </h1>
          <p className="text-sm sm:text-base text-primary-300">
            Update your password to keep your account secure
          </p>
        </div>
        <Link
          to="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 text-sm sm:text-base w-fit"
        >
          <ArrowLeft size={18} />
          Back to Settings
        </Link>
      </div>

      {/* Security Info Banner */}
      <div
        className="bg-linear-to-br from-blue-900/20 to-blue-800/10 border border-blue-900/50 rounded-xl p-4 sm:p-6"
        data-aos="fade-up"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-900/30 rounded-lg shrink-0">
            <Shield size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-light mb-2">
              Password Security Tips
            </h3>
            <ul className="text-sm text-primary-300 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400 shrink-0" />
                Use at least 8 characters with a mix of letters, numbers, and
                symbols
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400 shrink-0" />
                Avoid using personal information or common words
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400 shrink-0" />
                Don't reuse passwords from other accounts
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6 sm:p-8"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="w-full">
            <label
              htmlFor="old_password"
              className="block text-sm font-medium text-primary-300 mb-2"
            >
              Current Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                <Lock size={20} />
              </div>
              <input
                type={showOldPassword ? "text" : "password"}
                id="old_password"
                placeholder="Enter your current password"
                className={`w-full pl-12 pr-12 py-3 bg-dark border ${
                  errors.old_password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                {...register("old_password")}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors"
              >
                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.old_password && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.old_password.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="w-full">
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-primary-300 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                <Lock size={20} />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                id="new_password"
                placeholder="Enter your new password"
                className={`w-full pl-12 pr-12 py-3 bg-dark border ${
                  errors.new_password
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                {...register("new_password")}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.new_password.message}
              </p>
            )}
            {/* Password Requirements */}
            {!errors.new_password && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-primary-400">
                  Password must contain:
                </p>
                <ul className="text-xs text-primary-500 space-y-0.5 ml-4">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="w-full">
            <label
              htmlFor="new_password2"
              className="block text-sm font-medium text-primary-300 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                <Lock size={20} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="new_password2"
                placeholder="Re-enter your new password"
                className={`w-full pl-12 pr-12 py-3 bg-dark border ${
                  errors.new_password2
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all`}
                {...register("new_password2")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.new_password2 && (
              <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.new_password2.message}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-primary-900"></div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-initial px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-light rounded-lg font-semibold transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-light border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Update Password
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              disabled={isPending}
              className="px-6 py-3 bg-dark border border-primary-800 hover:border-primary-600 text-light rounded-lg font-medium transition-all hover:bg-primary-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Additional Security Options */}
      <div
        className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-xl p-6"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <h3 className="font-heading text-lg font-bold text-light mb-4">
          Additional Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
            <div>
              <p className="font-medium text-light mb-1">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-primary-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <button className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg text-sm font-medium transition-all">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary-900/20 rounded-lg border border-primary-900">
            <div>
              <p className="font-medium text-light mb-1">Active Sessions</p>
              <p className="text-sm text-primary-400">
                Manage devices where you're logged in
              </p>
            </div>
            <button className="px-4 py-2 bg-dark border border-primary-800 hover:border-primary-600 text-primary-300 rounded-lg text-sm font-medium transition-all">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
