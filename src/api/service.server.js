import { endpoints } from "./endpoints";
import { fetcher } from "@/lib/axios-server";

// Server-side function for metadata generation - fetches from list and filters by slug
export const getServiceDetails = async (slug) => {
  if (!slug) return null;

  try {
    const data = await fetcher(endpoints.service.list);
    const services = data?.data || [];
    return services.find((service) => service.slug === slug) || null;
  } catch (error) {
    // Silently handle error - page will use client-side data
    return null;
  }
};
