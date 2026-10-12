import { endpoints } from "./endpoints";

import { fetcher as serverFetcher } from "@/lib/axios-server";

export async function getProductDetails(slug) {
  try {
    const response = await serverFetcher(endpoints.product.details(slug));

    // Response structure: { status, success, message, data: {...product} }
    return response.data || {};
  } catch (error) {
    console.error(error);

    return {};
  }
}

export async function getRelatedProducts(slug) {
  try {
    const response = await serverFetcher(
      endpoints.product.relatedProducts(slug),
    );

    return response.data;
  } catch (error) {
    console.error(error);

    return [];
  }
}

export const getProductReviews = async (id) => {
  try {
    const response = await serverFetcher(endpoints.product.getReviews(id));

    return response.data ?? [];
  } catch (error) {
    console.error(error);

    throw error;
  }
};
