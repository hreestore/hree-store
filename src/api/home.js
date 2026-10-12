"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

export const useGetHomeSliders = () => {
  const { data, error, isLoading } = useSWR(endpoints.home.slider, fetcher);

  return {
    sliders: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeCategoryProducts = () => {
  const { data, error, isLoading } = useSWR(
    endpoints.home.categoryProducts,
    fetcher,
  );
  // console.log("Endpoints being called:", {
  //   slider: endpoints.home.slider,
  //   categoryProducts: endpoints.home.categoryProducts,
  //   // ... other endpoints
  // });

  return {
    categoryProducts: data?.data || [],
    error,
    isLoading,
  };
};
export const useGetHomeClients = () => {
  const { data, error, isLoading } = useSWR(endpoints.home.clients, fetcher);

  return {
    clients: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeRecentProducts = () => {
  const { data, error, isLoading } = useSWR(
    endpoints.home.recentProducts,
    fetcher,
  );

  return {
    recentProducts: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeFlashSale = () => {
  const { data, error, isLoading } = useSWR(endpoints.home.flashSale, fetcher);

  return {
    flashSale: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeTestimonial = () => {
  const { data, error, isLoading } = useSWR(
    endpoints.home.testimonials,
    fetcher,
  );

  return {
    testimonials: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeYoutubeShorts = () => {
  const { data, error, isLoading } = useSWR(
    endpoints.home.youtubeShorts,
    fetcher,
  );

  return {
    youtubeShorts: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeCommitments = () => {
  const { data, error, isLoading } = useSWR(
    endpoints.home.commitments,
    fetcher,
  );

  return {
    commitments: data?.data || [],
    error,
    isLoading,
  };
};
export const useGetHomeConcerns = () => {
  const { data, error, isLoading } = useSWR(endpoints.home.concerns, fetcher);

  return {
    concerns: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetHomeFaqs = () => {
  const { data, error, isLoading } = useSWR(endpoints.home.faqs, fetcher);

  return {
    faqs: data?.data || [],
    error,
    isLoading,
  };
};
