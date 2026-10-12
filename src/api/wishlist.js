import { endpoints } from "./endpoints";

import { fetcher, poster } from "@/lib/axios-client";

export const getWishlistData = async () => {
  try {
    const response = await fetcher(endpoints.wishlist.getProducts);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addProductToWishlist = async (product) => {
  try {
    const response = await poster(endpoints.wishlist.addProduct, product);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeProductFromWishlist = async (productId) => {
  try {
    const response = await poster(endpoints.wishlist.removeProduct(productId));

    return response;
  } catch (error) {
    throw error;
  }
};
