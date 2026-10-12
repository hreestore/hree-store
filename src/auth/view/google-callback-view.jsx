"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

import { paths } from "@/routes/paths";
import { useRouter, useSearchParams } from "@/routes/hooks";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser } from "@/redux/actions";

import { toast } from "@/components/snackbar";

import { addProductToCart, googleExchange } from "@/api";

export function GoogleCallbackView() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { items } = useAppSelector((state) => state.cart);

    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState(null);
    const hasProcessedRef = useRef(false);

    useEffect(() => {
        const handleGoogleCallback = async () => {
            const code = searchParams.get("code");
            const token = searchParams.get("token");
            const sessionKey = `google_oauth_processed_${code || token}`;

            if (typeof window !== 'undefined' && window.sessionStorage.getItem(sessionKey)) {
                console.log('[Google OAuth] Already processed this code/token in this session, skipping...');
                setIsProcessing(false);
                return;
            }

            if (hasProcessedRef.current) {
                console.log('[Google OAuth] Already processed, skipping...');
                return;
            }
            hasProcessedRef.current = true;
            console.log('[Google OAuth] Processing callback...');

            if (typeof window !== 'undefined' && (code || token)) {
                window.sessionStorage.setItem(sessionKey, 'true');
            }

            try {
                const errorParam = searchParams.get("error");
                if (errorParam) {
                    setError(decodeURIComponent(errorParam));
                    toast.error(
                        decodeURIComponent(errorParam) ||
                        "Google authentication failed. Please try again."
                    );
                    setIsProcessing(false);
                    setTimeout(() => {
                        router.push(paths.auth.signIn);
                    }, 3000);
                    return;
                }

                const tokenParam = searchParams.get("token");
                const customerIdParam = searchParams.get("customer_id");
                const messageParam = searchParams.get("message");

                if (tokenParam) {
                    dispatch(
                        setUser({
                            customer: { id: customerIdParam },
                            token: tokenParam,
                            token_type: "Bearer",
                        })
                    );

                    if (items?.length > 0) {
                        try {
                            await addProductToCart(items, tokenParam);
                        } catch (cartError) {
                            console.error("Failed to sync cart:", cartError);
                        }
                    }

                    toast.success(
                        messageParam || "Successfully signed in with Google!"
                    );

                    setTimeout(() => {
                        router.push(paths.home);
                    }, 1500);
                    return;
                }

                const codeParam = searchParams.get("code");
                if (!codeParam) {
                    setError("No authorization code or token received");
                    toast.error("No authorization code or token received");
                    setIsProcessing(false);
                    setTimeout(() => {
                        router.push(paths.auth.signIn);
                    }, 3000);
                    return;
                }

                console.log('[Google OAuth] Attempting to exchange code...');

                const response = await googleExchange(codeParam);
                console.log('[Google OAuth] Code exchange successful');

                if (response.success && response.customer && response.token) {
                    dispatch(
                        setUser({
                            customer: response.customer,
                            token: response.token,
                            token_type: response.token_type,
                        })
                    );

                    if (items?.length > 0) {
                        try {
                            await addProductToCart(items, response.token);
                        } catch (cartError) {
                            console.error("Failed to sync cart:", cartError);
                        }
                    }

                    toast.success(
                        response.message || "Successfully signed in with Google!"
                    );

                    if (!response.customer.phone_number) {
                        setTimeout(() => {
                            router.push(paths.profile.root);
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            router.push(paths.home);
                        }, 1500);
                    }
                } else {
                    throw new Error("Invalid response from server");
                }
            } catch (err) {
                console.error("[Google OAuth] Error:", err);

                const errorMessage = err?.message || "Failed to complete Google sign-in";

                if (errorMessage.includes("already been used")) {
                    setError("OAuth error: Please contact support or try signing in again.");
                    toast.error("Authentication session expired. Please try signing in again.");
                } else {
                    setError(errorMessage);
                    toast.error(errorMessage);
                }

                setIsProcessing(false);
                setTimeout(() => {
                    router.push(paths.auth.signIn);
                }, 3000);
            }
        };

        handleGoogleCallback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="min-h-screen pt-32 pb-24 bg-gray-50/50 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 sm:px-6 w-full">
                <div className="bg-[#ffffff] rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
                    {isProcessing && !error && (
                        <>
                            <div className="flex justify-center mb-6">
                                <Loader2 className="w-12 h-12 text-[#711a20] animate-spin" />
                            </div>
                            <p className="text-gray-500 text-lg">Completing Google sign-in...</p>
                        </>
                    )}

                    {error && (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-display font-black uppercase tracking-tighter mb-4">
                                Authentication Failed
                            </h1>
                            <p className="text-gray-500 mb-8">
                                {error}
                            </p>
                            <Link
                                href={paths.auth.signIn}
                                className="inline-block w-full bg-black text-[#ffffff] py-4 rounded-full font-black uppercase tracking-tighter hover:bg-[#711a20] transition-all"
                            >
                                Back to Sign In
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
