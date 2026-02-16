import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  User,
  Building,
  Loader,
  Phone,
  Users,
  ShoppingBag,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useRegister } from "../hooks/useUser";
import { toast } from "react-toastify";

// Validation Schema
const signupSchema = yup.object().shape({
  first_name: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  last_name: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Please enter a valid phone number",
    ),
  user_type: yup
    .string()
    .oneOf(["customer", "organizer"], "Please select a valid user type")
    .required("User type is required"),
  organization: yup.string().when("user_type", {
    is: "organizer",
    then: (schema) =>
      schema.required("Organization is required for event organizers"),
    otherwise: (schema) => schema.notRequired(),
  }),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required("Password is required"),
  password2: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  terms: yup
    .boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required("You must accept the terms and conditions"),
});

interface SignupFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: "customer" | "organizer";
  organization?: string;
  password: string;
  password2: string;
  terms: boolean;
}

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      user_type: "customer",
    },
  });

  const navigate = useNavigate();
  const { mutate: registerUser, isPending } = useRegister();

  // Watch user_type to conditionally show organization field
  const userType = watch("user_type");

  const onSubmit = (data: SignupFormData) => {
    // Remove the terms field before sending to API
    const { terms, ...registerData } = data;

    // If customer, remove organization field
    if (registerData.user_type === "customer") {
      delete registerData.organization;
    }

    registerUser(registerData, {
      onSuccess: () => {
        toast.success("Registration successful!");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.detail ||
            "Registration failed. Please try again.",
        );
      },
    });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl w-full">
        {/* Signup Card */}
        <div
          data-aos="fade-up"
          className="bg-linear-to-br from-dark-light to-dark border border-primary-900 rounded-2xl shadow-2xl p-8 md:p-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-light mb-2">
              Create Your Account
            </h2>
            <p className="text-primary-300">
              Start managing your events or purchasing tickets with EventInvite
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Type Selection */}
            <div className="w-full">
              <label className="block text-sm font-medium text-primary-300 mb-3">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Customer Option */}
                <label
                  className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    userType === "customer"
                      ? "border-primary-600 bg-primary-900/20"
                      : "border-primary-800 hover:border-primary-700"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    value="customer"
                    disabled={isPending}
                    className="sr-only"
                    {...register("user_type")}
                  />
                  <ShoppingBag
                    size={32}
                    className={`mb-2 ${
                      userType === "customer"
                        ? "text-primary-400"
                        : "text-primary-600"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      userType === "customer"
                        ? "text-light"
                        : "text-primary-300"
                    }`}
                  >
                    Buy Tickets
                  </span>
                  <span className="text-xs text-primary-500 mt-1 text-center">
                    Purchase event tickets
                  </span>
                </label>

                {/* Organizer Option */}
                <label
                  className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    userType === "organizer"
                      ? "border-primary-600 bg-primary-900/20"
                      : "border-primary-800 hover:border-primary-700"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    value="organizer"
                    disabled={isPending}
                    className="sr-only"
                    {...register("user_type")}
                  />
                  <Users
                    size={32}
                    className={`mb-2 ${
                      userType === "organizer"
                        ? "text-primary-400"
                        : "text-primary-600"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      userType === "organizer"
                        ? "text-light"
                        : "text-primary-300"
                    }`}
                  >
                    Create Events
                  </span>
                  <span className="text-xs text-primary-500 mt-1 text-center">
                    Organize and manage events
                  </span>
                </label>
              </div>
              {errors.user_type && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.user_type.message}
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-6">
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
                    placeholder="John"
                    disabled={isPending}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                      errors.first_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                    } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    {...register("first_name")}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-400">
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
                    placeholder="Doe"
                    disabled={isPending}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                      errors.last_name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                    } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    {...register("last_name")}
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Input */}
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
                  placeholder="john@example.com"
                  disabled={isPending}
                  className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number & Organization */}
            <div className="grid md:grid-cols-2 gap-6">
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
                    placeholder="+1234567890"
                    disabled={isPending}
                    className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                      errors.phone_number
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                    } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    {...register("phone_number")}
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              {/* Organization - Only shown for organizers */}
              {userType === "organizer" && (
                <div className="w-full">
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-primary-300 mb-2"
                  >
                    Organization <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                      <Building size={20} />
                    </div>
                    <input
                      type="text"
                      id="organization"
                      placeholder="Your company"
                      disabled={isPending}
                      className={`w-full pl-12 pr-4 py-3 bg-dark border ${
                        errors.organization
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                      } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      {...register("organization")}
                    />
                  </div>
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.organization.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a strong password"
                  disabled={isPending}
                  className={`w-full pl-12 pr-12 py-3 bg-dark border ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
              {/* Password Requirements */}
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
            </div>

            {/* Confirm Password Input */}
            <div className="w-full">
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-primary-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500">
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="password2"
                  placeholder="Re-enter your password"
                  disabled={isPending}
                  className={`w-full pl-12 pr-12 py-3 bg-dark border ${
                    errors.password2
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-primary-800 focus:border-primary-600 focus:ring-primary-600/20"
                  } rounded-lg text-light placeholder-primary-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  {...register("password2")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password2.message}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="terms"
                  type="checkbox"
                  disabled={isPending}
                  className="h-4 w-4 bg-dark border-primary-800 rounded text-primary-600 focus:ring-primary-600 focus:ring-offset-0 disabled:opacity-50"
                  {...register("terms")}
                />
              </div>
              <label htmlFor="terms" className="ml-3 text-sm">
                <span className="text-primary-300">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-400 -mt-4">
                {errors.terms.message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-light px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg hover:shadow-primary-600/50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <UserPlus size={20} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-primary-900"></div>
            <span className="px-4 text-sm text-primary-500">or</span>
            <div className="flex-1 border-t border-primary-900"></div>
          </div>

          {/* Social Signup */}
          <div className="space-y-3">
            <button
              disabled={isPending}
              className="w-full bg-dark border border-primary-800 hover:border-primary-600 text-light px-6 py-3 rounded-lg font-medium transition-all hover:bg-primary-900/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-primary-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-400 hover:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Signup;
