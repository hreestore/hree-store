"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

// ----------------------------------------------------------------------

export const useGetBlogs = () => {
  const { data, error, isLoading } = useSWR(endpoints.blog.list, fetcher);

  return {
    blogs: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetBlogDetail = (slug) => {
  const { data, error, isLoading } = useSWR(
    endpoints.blog.details(slug),
    fetcher
  );

  return {
    blog: data?.data[0] || {},
    error,
    isLoading,
  };
};
