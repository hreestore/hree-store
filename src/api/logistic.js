import { endpoints } from "./endpoints";

import { fetcher, poster } from "@/lib/axios-server";

export const getLogisticCharge = async (id) => {
  try {
    const response = await fetcher(endpoints.logistic.getCharge(id));

    return response.data[0];
  } catch (error) {
    throw error;
  }
};

export const getUpayaLocations = async () => {
  try {
    const response = await fetcher(endpoints.logistic.upayaLocations);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUpayaDeliveryRate = async (location_id, area_id) => {
  try {
    const response = await poster(endpoints.logistic.upayaDeliveryRate, {
      location_id,
      area_id
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
