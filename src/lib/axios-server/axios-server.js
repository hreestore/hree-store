import axios from "axios";

import { CONFIG } from "@/global-config";

// ----------------------------------------------------------------------

const axiosServerInstance = axios.create({
  baseURL: CONFIG.serverUrl,
});

axiosServerInstance.interceptors.request.use(
  (config) => {
    config.headers["Vendor"] = CONFIG.vendorToken;

    return config;
  },
  (error) => Promise.reject(error)
);

axiosServerInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!"
    )
);

// ----------------------------------------------------------------------

export default axiosServerInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosServerInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    // Re-throw without logging - let the caller handle error logging
    throw error;
  }
};

export const poster = async (args, data) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  try {
    const response = data
      ? await axiosServerInstance.post(url, data, { ...config })
      : await axiosServerInstance.post(url, { ...config });

    return response.data;
  } catch (error) {
    throw error;
  }
};
