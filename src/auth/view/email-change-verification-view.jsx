"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Mail, Loader2 } from "lucide-react";

import { paths } from "@/routes/paths";
import { useRouter, useSearchParams } from "@/routes/hooks";

import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/actions";

import { toast } from "@/components/snackbar";

export function EmailChangeVerificationView() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isProcessing, setIsProcessing] = useState(true);

    const status = searchParams.get("status");
    const message = searchParams.get("message");

    useEffect(() => {
        if (status === "success") {
            dispatch(setUser(null));

            toast.success(
                decodeURIComponent(message || "Email changed successfully! Please sign in with your new email.")
            );

            setIsProcessing(false);

            setTimeout(() => {
                router.push(paths.auth.signIn);
            }, 3000);
        } else if (status === "error") {
            toast.error(
                decodeURIComponent(message || "Verification link has expired")
            );
            setIsProcessing(false);
        } else {
            setIsProcessing(false);
        }
    }, [status, message, router, dispatch]);

    return (
        <main className="min-h-screen pt-32 pb-24 bg-gray-50/50 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 sm:px-6 w-full">
                <div className="bg-[#ffffff] rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
                    {isProcessing && (
                        <>
                            <div className="flex justify-center mb-6">
                                <Loader2 className="w-12 h-12 text-[#711a20] animate-spin" />
                            </div>
                            <p className="text-gray-500 text-lg">Verifying your new email...</p>
                        </>
                    )}

                    {!isProcessing && status === "success" && (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">
                                Email Changed!
                            </h1>
                            <p className="text-gray-500 mb-4">
                                {decodeURIComponent(message || "Your email has been updated successfully.")}
                            </p>
                            <p className="text-gray-400 text-sm mb-2">
                                Please sign in with your new email address.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Redirecting to sign in page...
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
                                {decodeURIComponent(message || "Verification link has expired or is invalid")}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={paths.profile.root}
                                    className="flex-1 bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] transition-all text-center"
                                >
                                    Go to Profile Settings
                                </Link>
                                <Link
                                    href={paths.home}
                                    className="flex-1 border-2 border-black/10 text-gray-700 py-4 rounded-full font-bold uppercase tracking-tight hover:bg-gray-50 transition-all text-center"
                                >
                                    Back to Home
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
                                Invalid Link
                            </h1>
                            <p className="text-gray-500 mb-8">
                                This email verification link is invalid or has expired.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={paths.profile.root}
                                    className="flex-1 bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] transition-all text-center"
                                >
                                    Go to Profile Settings
                                </Link>
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
