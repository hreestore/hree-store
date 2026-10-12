"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { paths } from "@/routes/paths";
import { useRouter, useSearchParams } from "@/routes/hooks";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUserToken } from "@/redux/actions";

import { toast } from "@/components/snackbar";

import { addProductToCart } from "@/api";

export function OAuthSuccessView() {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const searchParams = useSearchParams();

  const { items } = useAppSelector((state) => state.cart);

  const token = searchParams.get("token");
  const customerId = searchParams.get("customer_id");
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (error) {
        toast.error(
          error || "Google authentication failed. Please try again."
        );
        setTimeout(() => {
          router.push(paths.auth.signIn);
        }, 2000);
        return;
      }

      if (token) {
        dispatch(setUserToken(token));

        if (items?.length > 0) {
          try {
            await addProductToCart(items, token);
          } catch (cartError) {
            console.error("Failed to sync cart:", cartError);
          }
        }

        if (message) {
          toast.success(message);
        } else {
          toast.success("Successfully signed in with Google!");
        }

        setTimeout(() => {
          router.push(paths.home);
        }, 1500);
      } else {
        toast.error("Authentication failed. No token received.");
        setTimeout(() => {
          router.push(paths.auth.signIn);
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [token, customerId, error, message, router, dispatch, items]);

  return (
    <main className="min-h-screen pt-32 pb-24 bg-gray-50/50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 sm:px-6 w-full">
        <div className="bg-[#ffffff] rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-black/5 text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-12 h-12 text-[#711a20] animate-spin" />
          </div>
          <p className="text-gray-500 text-lg">
            {error ? "Redirecting..." : "Completing sign in..."}
          </p>
        </div>
      </div>
    </main>
  );
}
