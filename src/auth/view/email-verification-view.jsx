"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Mail, Loader2 } from "lucide-react";

import { paths } from "@/routes/paths";
import { useRouter, useSearchParams } from "@/routes/hooks";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser } from "@/redux/actions";

import { toast } from "@/components/snackbar";

import { resendVerification } from "@/api";

export function EmailVerificationView() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const user = useAppSelector((state) => state.user);

    const [isProcessing, setIsProcessing] = useState(true);
    const [canResend, setCanResend] = useState(true);
    const [resendCooldown, setResendCooldown] = useState(0);

    const status = searchParams.get("status");
    const message = searchParams.get("message");

    useEffect(() => {
        if (status === "success") {
            if (user?.customer) {
                dispatch(
                    setUser({
                        ...user,
                        customer: {
                            ...user.customer,
                            email_verified: true,
                        },
                    })
                );
            }

            toast.success(decodeURIComponent(message || "Email verified successfully!"));

            setIsProcessing(false);

            setTimeout(() => {
                router.push(paths.home);
            }, 3000);
        } else if (status === "error") {
            toast.error(decodeURIComponent(message || "Verification link has expired"));
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
        }
    }, [status, message, router, dispatch, user]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendCooldown]);

    const handleResendVerification = async () => {
        try {
            const email = user?.customer?.email;
            if (!email) {
                toast.error("Email address not found. Please sign in again.");
                router.push(paths.auth.signIn);
                return;
            }

            await resendVerification(email);
            toast.success("Verification email has been resent. Please check your email.");

            setCanResend(false);
            setResendCooldown(60);
        } catch (error) {
            toast.error(error?.message || "Failed to resend verification email");
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-24 bg-gray-50/50 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 sm:px-6 w-full">
                <div className="bg-[#ffffff] rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
                    {isProcessing && (
                        <>
                            <div className="flex justify-center mb-6">
                                <Loader2 className="w-12 h-12 text-[#711a20] animate-spin" />
                            </div>
                            <p className="text-gray-500 text-lg">Verifying your email...</p>
                        </>
                    )}

                    {!isProcessing && status === "success" && (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">
                                Email Verified!
                            </h1>
                            <p className="text-gray-500 mb-4">
                                {decodeURIComponent(message || "Your email has been successfully verified.")}
                            </p>
                            <p className="text-gray-400 text-sm">
                                Redirecting to homepage...
                            </p>
                        </>
                    )}

                    {!isProcessing && status === "error" && (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">
                                Verification Failed
                            </h1>
                            <p className="text-gray-500 mb-8">
                                {decodeURIComponent(message || "Verification link has expired")}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={!canResend}
                                    className="flex-1 bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {canResend ? "Resend Verification" : `Resend in ${resendCooldown}s`}
                                </button>
                                <Link
                                    href={paths.auth.signIn}
                                    className="flex-1 border-2 border-black/10 text-gray-700 py-4 rounded-full font-bold uppercase tracking-tight hover:bg-gray-50 transition-all text-center"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}

                    {!isProcessing && !status && (
                        <>
                            <div className="w-20 h-20 bg-[#711a20]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-10 h-10 text-[#711a20]" />
                            </div>
                            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">
                                Verify Your Email
                            </h1>
                            <p className="text-gray-500 mb-8">
                                Please check your email inbox for a verification link.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={!canResend}
                                    className="flex-1 bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {canResend ? "Resend Verification Email" : `Resend in ${resendCooldown}s`}
                                </button>
                                <Link
                                    href={paths.home}
                                    className="flex-1 border-2 border-black/10 text-gray-700 py-4 rounded-full font-bold uppercase tracking-tight hover:bg-gray-50 transition-all text-center"
                                >
                                    Back to Home
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
