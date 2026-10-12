"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

import { useAppSelector } from "@/redux/hooks";

import { toast } from "@/components/snackbar";

import { resendVerification } from "@/api";

// ----------------------------------------------------------------------

export function EmailVerificationBanner() {
    const user = useAppSelector((state) => state.user);

    const [isVisible, setIsVisible] = useState(true);
    const [canResend, setCanResend] = useState(true);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Check if user is logged in and email is not verified
    const shouldShow =
        isVisible &&
        user?.customer &&
        user.customer.email_verified === false;

    // Cooldown timer for resend button
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
                toast.error("Email address not found");
                return;
            }

            await resendVerification(email);
            toast.success(
                "Verification email has been resent. Please check your email."
            );

            // Start cooldown
            setCanResend(false);
            setResendCooldown(60);
        } catch (error) {
            toast.error(error?.message || "Failed to resend verification email");
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!shouldShow) {
        return null;
    }

    return (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                    Please verify your email to access your complete order history and all features.
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={handleResendVerification}
                    disabled={!canResend}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-amber-600 text-amber-700 rounded-full hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {canResend ? "Resend Verification" : `Resend in ${resendCooldown}s`}
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
