"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

export const useGetSocialMediaData = () => {
    const { data, error, isLoading } = useSWR(endpoints.socialMedia, fetcher);

    return {
        socialMediaData: data?.data || {},
        error,
        isLoading,
    };
};
