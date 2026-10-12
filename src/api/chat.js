import { endpoints } from "./endpoints";

import { fetcher, poster } from "@/lib/axios-client";

export const getChat = async () => {
  try {
    const response = await fetcher(endpoints.chat.get);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createChat = async (productId) => {
  try {
    const response = await poster(endpoints.chat.createChat(productId));

    return response.data[0];
  } catch (error) {
    throw error;
  }
};

export const sendMessage = async (data) => {
  try {
    const response = await poster(endpoints.chat.sendMessage, data);

    return response;
  } catch (error) {
    // Check if it's a rate limit error
    if (error.response?.status === 429) {
      const rateLimitError = new Error("You're sending messages too fast. Please wait a moment.");
      rateLimitError.response = error.response;
      throw rateLimitError;
    }
    throw error;
  }
};
