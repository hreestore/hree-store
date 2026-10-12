import { endpoints } from "./endpoints";

import { fetcher, poster } from "@/lib/axios-client";

export const getProfile = async () => {
  try {
    const response = await fetcher(endpoints.profile.get);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await poster(endpoints.profile.update, userData);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await poster(
      endpoints.profile.updatePassword,
      passwordData
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await poster(endpoints.profile.addAddress, addressData);

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeAddress = async (addressId) => {
  try {
    const response = await poster(endpoints.profile.removeAddress(addressId));

    return response.data;
  } catch (error) {
    throw error;
  }
};
