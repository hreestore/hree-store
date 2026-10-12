"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";
import { fetcher } from "@/lib/axios-server";

// import { fetcher } from "@/lib/axios-client";

export const useGetStates = () => {
  const { data, error, isLoading } = useSWR(
    endpoints.address.getStates,
    fetcher
  );

  return {
    states: data?.data || [],
    error,
    isLoading,
  };
};
