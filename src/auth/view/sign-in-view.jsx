"use client";

import { z as zod } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Loader2, X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser, getCartDataRequest } from "@/redux/actions";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";

import { toast } from "@/components/snackbar";
import { Logo } from "@/components/logo";

import { GoogleAuth } from "../components/google-auth";

import { syncCartToServer, signIn, requestOtp, verifyOtp, resendOtp } from "@/api";
import { axiosInstance } from "@/lib/axios-client";

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),
  password: zod
    .string()
    .min(1, { message: "Password is required!" })
    .min(6, { message: "Password must be at least 6 characters!" }),
});

export const OtpSignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),
});

// ----------------------------------------------------------------------

export function SignInView() {
  const vendor = useAppSelector((state) => state.vendor.vendor);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [userEmail, setUserEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(5);

  const dispatch = useAppDispatch();

  const { items } = useAppSelector((state) => state.cart);
  const { user, userToken } = useAppSelector((state) => state.auth);

  const [errorMessage, setErrorMessage] = useState("");

  // Redirect to profile if user is already logged in
  useEffect(() => {
    if (user?.customer?.id || userToken) {
      router.push(paths.profile.root);
    }
  }, [user, userToken, router]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isOtpMode ? OtpSignInSchema : SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage("");

      // If in OTP mode, request OTP instead of signing in
      if (isOtpMode) {
        const response = await requestOtp(data.email);

        // Handle API response structure
        if (response?.success && response?.data) {
          const expiryMinutes = response.data.expires_in_minutes || 5;
          setOtpExpiryMinutes(expiryMinutes);

          toast.success(response.message || "OTP sent to your email!");
          setUserEmail(data.email);
          setOtpDialogOpen(true);
          setResendCountdown(60);
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
        return;
      }

      const userData = await signIn(data);

      // Set Authorization header immediately so subsequent API calls
      // (cart fetch, profile, etc.) have the token before redux-persist
      // has had a chance to write to localStorage.
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${userData.token}`;

      // Store user data and token
      dispatch(setUser(userData));

      // Sync cart items if any (non-critical)
      if (items?.length > 0) {
        try {
          await syncCartToServer(items, userData.token);
        } catch (syncError) {
          console.error("[SIGN IN] Cart sync failed (non-critical):", syncError);
        }
      }

      // Fetch fresh cart from server
      dispatch(getCartDataRequest());

      reset();

      if (userData.customer?.email_verified === false) {
        toast.success("Login successful! Please verify your email to access full features.");
      } else {
        toast.success("Login successful!");
      }

      router.back();
    } catch (error) {
      console.error("Sign in error:", error);

      if (error?.status === 401 || error?.status === 422 || error?.status === 400) {
        if (error?.message && typeof error.message === 'object') {
          const errorMessages = Object.values(error.message).flat().filter(msg => typeof msg === 'string');
          setErrorMessage(errorMessages.join(", "));
        } else if (error?.errors && typeof error.errors === 'object') {
          const errorMessages = Object.values(error.errors).flat().filter(msg => typeof msg === 'string');
          setErrorMessage(errorMessages.join(", "));
        } else if (error?.message && typeof error.message === 'string') {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Invalid credentials. Please check your email and password.");
        }
      } else if (error?.status === 403) {
        const messageStr = typeof error?.message === 'string' ? error.message : '';
        if (messageStr.includes("verify your email")) {
          setErrorMessage("Please verify your email before logging in.");
        } else if (messageStr.includes("inactive")) {
          setErrorMessage("Your account is inactive. Please contact support.");
        } else {
          setErrorMessage(messageStr || "Access forbidden.");
        }
      } else if (error?.message) {
        setErrorMessage(typeof error.message === 'string' ? error.message : "Oops! Something went wrong.");
      } else {
        setErrorMessage("Oops! Something went wrong. Please try again.");
      }
    }
  });

  const handleToggleAuthMode = () => {
    setIsOtpMode(!isOtpMode);
    setErrorMessage("");
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtpValues = pastedData.split("");
      setOtpValues(newOtpValues);
      const lastInput = document.getElementById("otp-input-5");
      if (lastInput) lastInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      setErrorMessage("");

      const otp = otpValues.join("");
      if (otp.length !== 6) {
        toast.error("Please enter complete 6-digit OTP");
        return;
      }

      const userData = await verifyOtp(userEmail, otp);

      // Set Authorization header immediately to avoid race condition
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${userData.token}`;

      dispatch(setUser(userData));

      if (items?.length > 0) {
        try {
          await syncCartToServer(items, userData.token);
        } catch (syncError) {
          console.error("[OTP VERIFY] Cart sync failed (non-critical):", syncError);
        }
      }

      dispatch(getCartDataRequest());

      reset();
      setOtpDialogOpen(false);
      setOtpValues(["", "", "", "", "", ""]);

      toast.success("Login successful!");
      router.back();
    } catch (error) {
      console.error("OTP verification error:", error);

      if (error?.status === 422 || error?.status === 400) {
        if (error?.message && typeof error.message === 'object') {
          const errorMessages = Object.values(error.message).flat().filter(msg => typeof msg === 'string');
          setErrorMessage(errorMessages.join(", "));
        } else if (error?.errors && typeof error.errors === 'object') {
          const errorMessages = Object.values(error.errors).flat().filter(msg => typeof msg === 'string');
          setErrorMessage(errorMessages.join(", "));
        } else if (error?.message && typeof error.message === 'string') {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Invalid OTP. Please try again.");
        }
      } else if (error?.message) {
        setErrorMessage(typeof error.message === 'string' ? error.message : "Invalid OTP. Please try again.");
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseOtpDialog = () => {
    setOtpDialogOpen(false);
    setOtpValues(["", "", "", "", "", ""]);
    setErrorMessage("");
    setResendCountdown(0);
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      setErrorMessage("");

      const response = await resendOtp(userEmail);

      if (response?.success) {
        const expiryMinutes = response.data?.expires_in_minutes || 5;
        setOtpExpiryMinutes(expiryMinutes);

        toast.success(response.message || "OTP resent to your email!");
        setOtpValues(["", "", "", "", "", ""]);
        setResendCountdown(60);

        const firstInput = document.getElementById("otp-input-0");
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 p-4 ">
      <div className="max-w-lg mx-auto sm:px-6">
        <div className=" rounded-[2.5rem] p-8 sm:p-12 shadow-sm border dark:border-white/100 border-black/5">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo href={paths.home} className="text-3xl scale-[2] mb-4" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tighter text-center mb-8">
            Sign In
          </h1>

          {/* Error Message */}
          {!!errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-black/10 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            {!isOtpMode && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-black/10 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter text-lg hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isOtpMode ? "Requesting OTP..." : "Signing in..."}
                </>
              ) : (
                isOtpMode ? "Request OTP" : "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-[#ffffff] text-sm text-gray-500">or</span>
            </div>
          </div>

          {/* Toggle Auth Mode */}
          <button
            onClick={handleToggleAuthMode}
            className="w-full dark:border-[#ffffff] border-2 border-black/10  py-4 rounded-full font-bold uppercase tracking-tight text-sm  transition-all flex items-center justify-center gap-2"
          >
            {isOtpMode ? (
              <>
                <Lock className="w-4 h-4" />
                Sign In with Password
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Sign In with OTP
              </>
            )}
          </button>

          {/* Google Auth */}
          {vendor?.has_oauth && (
            <div className="mt-4">
              <GoogleAuth type="Sign in" />
            </div>
          )}

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-500 text-sm">Don&apos;t have an account? </span>
            <Link
              href={paths.auth.signUp}
              className="text-[#711a20] font-bold text-sm hover:underline"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>

      {/* OTP Dialog */}
      {otpDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#ffffff] rounded-[2.5rem] w-full max-w-md p-8 sm:p-12 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={handleCloseOtpDialog}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-2">
                Verify OTP
              </h2>
              <p className="text-gray-500 text-sm">
                Enter the 6-digit code sent to {userEmail}
              </p>
              <p className="text-amber-600 text-xs mt-1">
                OTP expires in {otpExpiryMinutes} {otpExpiryMinutes === 1 ? "minute" : "minutes"}
              </p>
            </div>

            {/* Error Message */}
            {!!errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 mb-8">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  autoFocus={index === 0}
                  className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center mb-8">
              {resendCountdown > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend OTP in {resendCountdown}s
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-[#711a20] font-bold text-sm hover:underline disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Resend OTP
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter text-lg hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
              <button
                onClick={handleCloseOtpDialog}
                className="w-full border-2 border-black/10 text-gray-700 py-4 rounded-full font-bold uppercase tracking-tight hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
