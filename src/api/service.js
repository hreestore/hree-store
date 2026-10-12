"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher, poster } from "@/lib/axios-server";

export const useGetServiceData = () => {
  const { data, error, isLoading } = useSWR(endpoints.service.list, fetcher);

  return {
    serviceData: data?.data || [],
    error,
    isLoading,
  };
};

// Client-side hook - fetches from list and filters by slug
export const useGetServiceDetail = (slug) => {
  const { data, error, isLoading } = useSWR(endpoints.service.list, fetcher);

  const services = data?.data || [];
  const serviceDetail = slug
    ? services.find((service) => service.slug === slug)
    : null;

  return {
    serviceDetail,
    error,
    isLoading,
  };
};

// Client-callable server action for form submission
export const sendServiceInquiry = async (inquiryData) => {
  try {
    const response = await poster(endpoints.serviceInquiry, inquiryData);
    return response;
  } catch (error) {
    throw error;
  }
};
