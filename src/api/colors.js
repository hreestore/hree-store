"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";
import { sizeCatalogueFetcher } from "@/lib/axios-server/axios-design-server";
import { fetcher } from "@/lib/axios-server";

// import { fetcher } from "@/lib/axios-client";

// export const useGetColors = () => {
//     const { data, error, isLoading } = useSWR(
//         endpoints.colors,
//         sizeCatalogueFetcher
//     );

//     return {
//         colors: Array.isArray(data) ? data : data?.data || [],
//         error,
//         isLoading,
//     };
// };

// export const useGetColors = () => {
//     const { data, error, isLoading } = useSWR(
//         endpoints.colors,
//         fetcher
//     );

//     return {
//         colors: Array.isArray(data) ? data : data?.data || [],
//         error,
//         isLoading,
//     };
// };
export const useGetColors = () => {
    const { data, error, isLoading } = useSWR(
        endpoints.colors,
        fetcher
    );

    const raw = Array.isArray(data) ? data : data?.data || [];
    const colors = Array.isArray(raw[0]) ? raw.flat() : raw; // ← flatten nested array

    return {
        colors,
        error,
        isLoading,
    };
};