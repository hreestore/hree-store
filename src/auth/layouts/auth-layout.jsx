"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getCartDataRequest,
  getWishlistRequest,
  getWishlistSuccess,
  getVendorDetailRequest,
  getProfileRequest,
} from "@/redux/actions";

import { axiosInstance } from "@/lib/axios-client";
import { addProductToWishlist } from "@/api";
import { clearGuestWishlist, getGuestWishlist } from "@/utils/wishlist-storage";

export function AuthLayout({ children }) {
  const dispatch = useAppDispatch();

  const { userToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Always fetch vendor details (doesn't require auth)
    dispatch(getVendorDetailRequest());
  }, []); // Only run once on mount

  useEffect(() => {
    let isMounted = true;

    const syncGuestWishlistToServer = async () => {
      const guestWishlist = getGuestWishlist();

      if (!guestWishlist.length) {
        return;
      }

      const uniqueItems = Array.from(
        new Map(
          guestWishlist.map((item) => {
            const key = `${item.product_id}-${item.variant_id || ""}`;
            return [key, item];
          })
        ).values()
      );

      await Promise.allSettled(
        uniqueItems.map((item) =>
          addProductToWishlist({
            product_id: item.product_id,
            ...(item.variant_id ? { variant_id: item.variant_id } : {}),
          })
        )
      );

      clearGuestWishlist();
    };

    if (userToken) {
      // Set Authorization header (axios interceptor will also handle this from localStorage)
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${userToken}`;

      // Fetch user-specific data only when authenticated
      dispatch(getProfileRequest());
      dispatch(getCartDataRequest());

      (async () => {
        await syncGuestWishlistToServer();
        if (isMounted) {
          dispatch(getWishlistRequest());
        }
      })();
    } else {
      // For guests, hydrate wishlist from local storage
      dispatch(getWishlistSuccess(getGuestWishlist()));

      // Remove Authorization header
      delete axiosInstance.defaults.headers.common.Authorization;
    }

    return () => {
      isMounted = false;
    };
  }, [userToken, dispatch]);

  return children;
}
