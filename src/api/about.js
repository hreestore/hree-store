"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

export const useGetAboutData = () => {
    const { data, error, isLoading } = useSWR(endpoints.about, fetcher);

    return {
        aboutData: data?.data || {},
        error,
        isLoading,
    };
};
