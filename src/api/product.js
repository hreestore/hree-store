"use client";

import useSWR from "swr";

import { endpoints } from "./endpoints";

import { poster as clientPoster } from "@/lib/axios-client";
import { fetcher as serverFetcher, fetcher as clientFetcher } from "@/lib/axios-server";

/**
 * Hook to fetch products list with comprehensive filtering and sorting
 * Supports: search, category, brand, price range, product type, featured, flash sale, new arrivals
 * @param {string} productFilterQuery - URL query string with filters
 */
export const useGetProducts = (productFilterQuery) => {
  const { data, error, isLoading, mutate } = useSWR(
    productFilterQuery ? `${endpoints.product.list}?${productFilterQuery}` : endpoints.product.list,
    serverFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    products: data?.data?.data || [],
    pagination: data?.data?.pagination || null,
    appliedFilters: data?.data?.filters_applied || null,
    filterValues: data?.data?.filter_values || null,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to fetch single product details by slug
 * @param {string} slug - Product slug identifier
 */
export const useGetProductDetails = (slug) => {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? endpoints.product.details(slug) : null,
    serverFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    product: data?.data || null,
    error,
    isLoading,
    mutate,
  };
};

/**
 * Hook to fetch related products by product slug
 * @param {string} slug - Product slug to find related products for
 */
export const useGetRelatedProducts = (slug) => {
  const { data, error, isLoading } = useSWR(
    slug ? endpoints.product.relatedProducts(slug) : null,
    serverFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    relatedProducts: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetCategories = () => {
  const { data, error, isLoading } = useSWR(endpoints.category, serverFetcher);

  return {
    categories: data?.data || [],
    error,
    isLoading,
  };
};

export const useGetBrands = () => {
  const { data, error, isLoading } = useSWR(endpoints.brand, serverFetcher);

  return {
    brands: data?.data || [],
    error,
    isLoading,
  };
};

export const addProductReview = async (productId, review) => {
  try {
    const response = await clientPoster(
      endpoints.product.addReview(productId),
      review
    );

    return response.data[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to build product filter query parameters
 * @param {Object} filters - Filter object with various filter options
 * @returns {URLSearchParams} - URL search params ready to append to API call
 */
export const buildProductFilterQuery = (filters = {}) => {
  const params = new URLSearchParams();

  // Search
  if (filters.search) {
    params.append('search', filters.search);
  }

  // Category
  if (filters.category || filters.categoryId || filters.category_id) {
    params.append('category_id', filters.category || filters.categoryId || filters.category_id);
  }

  // Brand (supports single or multiple)
  if (filters.brand || filters.brandId || filters.brand_id) {
    const brandValue = filters.brand || filters.brandId || filters.brand_id;
    if (Array.isArray(brandValue)) {
      params.append('brand_id', brandValue.join(','));
    } else {
      params.append('brand_id', brandValue);
    }
  }

  // Product Type
  if (filters.productType || filters.product_type) {
    params.append('product_type', filters.productType || filters.product_type);
  }

  // Name filter (alternative to search)
  if (filters.name && !filters.search) {
    params.append('name', filters.name);
  }

  // Price Range
  if (filters.minPrice !== undefined || filters.min_price !== undefined || filters.price_min !== undefined) {
    params.append('price_min', filters.minPrice || filters.min_price || filters.price_min);
  }
  if (filters.maxPrice !== undefined || filters.max_price !== undefined || filters.price_max !== undefined) {
    params.append('price_max', filters.maxPrice || filters.max_price || filters.price_max);
  }

  // Boolean flags
  if (filters.featured) {
    params.append('featured', true);
  }
  if (filters.flashSale || filters.flash_sale) {
    params.append('flash_sale', true);
  }
  if (filters.newArrivals || filters.new_arrivals) {
    params.append('new_arrivals', true);
  }
  if (filters.isCustomizable || filters.is_customizable) {
    params.append('is_customizable', '1');
  }
  // Sorting
  if (filters.sortBy || filters.sort_by || filters.orderBy || filters.order_by) {
    const sortValue = filters.sortBy || filters.sort_by || filters.orderBy || filters.order_by;
    params.append('sort_by', sortValue);
  }
  if (filters.sortOrder || filters.sort_order) {
    params.append('sort_order', filters.sortOrder || filters.sort_order);
  }

  // Pagination
  if (filters.page) {
    params.append('page', filters.page);
  }
  if (filters.perPage || filters.per_page) {
    params.append('per_page', filters.perPage || filters.per_page);
  }

  return params.toString();
};
