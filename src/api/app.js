"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

export const useGetPages = () => {
  const { data, error, isLoading } = useSWR(endpoints.app.getPages, fetcher);

  const pages = (data?.data || []).map(({ slug, ...rest }) => ({
    ...rest,
    path: `/${slug}`,
  }));

  return {
    pages: pages,
    error,
    isLoading,
  };
};
