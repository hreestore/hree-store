"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

// ----------------------------------------------------------------------

export const useGetStoreLocations = () => {
    const { data, error, isLoading } = useSWR(endpoints.storeLocation, fetcher);

    return {
        storeLocations: data?.data || [],
        error,
        isLoading,
    };
};