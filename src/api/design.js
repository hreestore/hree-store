"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";
import { fetcher } from "@/lib/axios-server";
import { CONFIG } from "@/global-config";

// ----------------------------------------------------------------------

export const useGetDesignCombination = () => {
    const { data, error, isLoading } = useSWR(endpoints.designCombination.list, fetcher);

    return {
        designCombination: data || [],
        designsLoading: isLoading,
        designsError: error,
    };
};

export const useGetDesignCombinationShow = (id) => {
    const { data, error, isLoading } = useSWR(
        id ? `${endpoints.designCombination.details(id)}` : null,
        fetcher
    );

    return {
        designCombinationShow: data,
        designLoading: isLoading,
        designError: error,
    };
};

/**
 * Helper function to get the full image URL for a design
 * @param {string} imagePath - The relative path from API (e.g., "uploads/32/2026/03/products/image_11774258839.png")
 * @returns {string} Full image URL
 */
export const getDesignImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${CONFIG.assetsDir}${imagePath}`;
};