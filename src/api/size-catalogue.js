"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";
import { fetcher } from "@/lib/axios-server";
// import { sizeCatalogueFetcher } from "@/lib/axios-server/axios-design-server";

// import { fetcher } from "@/lib/axios-client";

export const useGetSizeCatalogue = (categoryId) => {
    const { data, error, isLoading } = useSWR(
        endpoints.sizeCatalogue(categoryId),
        fetcher
    );

    return {
        sizeCatalogue: data?.data || [],
        error,
        isLoading,
    };
};
