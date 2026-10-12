"use client";

import { z as zod } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser } from "@/redux/actions";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";

import { toast } from "@/components/snackbar";
import { Logo } from "@/components/logo";

import { SignUpTerms } from "../components/sign-up-terms";
import { GoogleAuth } from "../components/google-auth";

import { AddressNewForm } from "@/sections/address";

import { addProductToCart, signUp, useGetStates } from "@/api";

// ----------------------------------------------------------------------

export const SignUpSchema = zod
  .object({
    name: zod.string().min(1, { message: "Name is required!" }),

    phone_number: zod
      .string()
      .min(1, { message: "Phone number is required!" })
      .regex(/^\d{10}$/, {
        message: "Phone number must be exactly 10 digits!",
      }),

    email: zod
      .string()
      .min(1, { message: "Email is required!" })
      .email({ message: "Email must be a valid email address!" }),

    password: zod
      .string()
      .min(1, { message: "Password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),

    password_confirmation: zod
      .string()
      .min(1, { message: "Confirm password is required!" })
      .min(8, { message: "Confirm password must be at least 8 characters!" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match!",
    path: ["password_confirmation"],
  });

// ----------------------------------------------------------------------

export function SignUpView() {
  const vendor = useAppSelector((state) => state.vendor.vendor);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [isEmailVerificationPending, setIsEmailVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

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

  const { states } = useGetStates();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage("");

      const response = await signUp(data);

      if (response.success && response.customer && response.token) {
        dispatch(
          setUser({
            customer: response.customer,
            token: response.token,
            token_type: response.token_type,
          })
        );

        if (items?.length > 0) {
          await addProductToCart(items, response.token);
        }

        reset();

        toast.success(
          response.message ||
          "Registration successful! Please verify your email to access full features."
        );

        setRegisteredEmail(data.email);
        setIsEmailVerificationPending(true);

        setTimeout(() => {
          router.push(paths.home);
        }, 2000);
      }
    } catch (error) {
      if (error?.email) {
        setErrorMessage(error.email[0]);
      } else if (error?.phone_number) {
        setErrorMessage(error.phone_number[0]);
      } else if (error?.password) {
        setErrorMessage(error.password[0]);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Oops! Something went wrong. Please try again");
      }
    }
  });

  // Email Verification Pending View
  if (isEmailVerificationPending) {
    return (
      <main className="min-h-screen pt-10 pb-16 ">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="dark:border-[#ffffff] rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo href={paths.home} className="text-3xl" />
            </div>

            {/* Email Icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-[#711a20]" />
            </div>

            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">
              Verify Your Email
            </h1>

            <p className=" mb-2">
              We&apos;ve sent a verification link to
            </p>
            <p className="font-bold text-gray-900 mb-6">
              {registeredEmail}
            </p>

            <p className=" text-sm mb-8">
              Please check your email and click on the verification link to activate your account.
            </p>

            <Link
              href={paths.auth.signIn}
              className="inline-block w-full bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter text-lg hover:bg-[#711a20] transition-all"
            >
              Go to Login
            </Link>

            <p className=" text-xs mt-6">
              Didn&apos;t receive the email? Check your spam folder.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen pt-10 pb-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className=" rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 dark:border-white">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo href={paths.home} className="text-3xl scale-[2] mb-4" />
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tighter text-center mb-2">
              Create Account
            </h1>
            <p className="text-center mb-8">
              Already have an account?{" "}
              <Link href={paths.auth.signIn} className="text-[#711a20] font-bold hover:underline">
                Sign in
              </Link>
            </p>

            {/* Error Message */}
            {!!errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Name & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 " />
                    </div>
                    <input
                      type="text"
                      {...register("name")}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-black/10 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 " />
                    </div>
                    <input
                      type="tel"
                      {...register("phone_number")}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-black/10 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                      placeholder="9812345678"
                    />
                  </div>
                  {errors.phone_number && (
                    <p className="mt-2 text-sm text-red-500">{errors.phone_number.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 " />
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
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 " />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-black/10 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5  hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5  hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em]  mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 " />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("password_confirmation")}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-black/10 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#711a20] focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5  hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5  hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-2 text-sm text-red-500">{errors.password_confirmation.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter text-lg hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Google Auth */}
            {vendor?.has_oauth && (
              <>
                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-[#ffffff] text-sm ">or</span>
                  </div>
                </div>

                <GoogleAuth type="Sign up" />
              </>
            )}

            {/* Terms */}
            <SignUpTerms />
          </div>
        </div>
      </main>

      <AddressNewForm
        open={showAddressForm}
        onClose={() => {
          setShowAddressForm(false);
          router.push(paths.home);
        }}
        states={states}
      />
    </>
  );
}
