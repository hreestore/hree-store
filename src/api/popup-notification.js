"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

// ----------------------------------------------------------------------

export const useGetPopupNotifications = () => {
    const { data, error, isLoading } = useSWR(endpoints.popupNotification, fetcher);

    return {
        popupNotifications: data?.data || [],
        error,
        isLoading,
    };
};