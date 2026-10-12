import { endpoints } from "./endpoints";

import { fetcher } from "@/lib/axios-server";

// ----------------------------------------------------------------------

// Server-side function for metadata generation
export const getBlogDetails = async (slug) => {
  try {
    const data = await fetcher(endpoints.blog.details(slug));
    return data?.data?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch blog details:", error);
    return null;
  }
};
