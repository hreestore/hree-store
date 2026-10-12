import { CONFIG } from "@/global-config";
import axios from "axios";
import { PERSIST_STORAGE_KEY } from "@/redux/persist-key";


// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Add Vendor header
    config.headers["Vendor"] = CONFIG.vendorToken;

    // Add Authorization header if token exists AND skipAuth is not set
    // skipAuth flag allows guest requests to bypass cached token
    if (!config.skipAuth && typeof window !== "undefined") {
      // Get token from localStorage (redux-persist key is PERSIST_STORAGE_KEY)
      const persistedAuth = localStorage.getItem(PERSIST_STORAGE_KEY);
      if (persistedAuth) {
        try {
          const persistedState = JSON.parse(persistedAuth);
          const authState = persistedState?.auth
            ? JSON.parse(persistedState.auth)
            : null;
          const token = authState?.userToken;
          if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error parsing persisted auth state:", error);
        }
      }
    }

    if (!config.suppressRequestLog) {
      console.log("[AXIOS] Request:", {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasVendorHeader: !!config.headers["Vendor"],
        hasAuthHeader: !!config.headers["Authorization"],
        skipAuth: config.skipAuth,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (!response.config?.suppressRequestLog) {
      console.log("[AXIOS] Response:", {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error) => {
    const shouldLogError = !error?.config?.suppressErrorLog;
    if (shouldLogError) {
      console.error("[AXIOS] Full Error Object:", error);
      console.error("[AXIOS] Error Details:", {
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message,
      });
    }

    if (error.response) {
      if (shouldLogError) {
        console.error("[AXIOS] Server responded with error");
      }
      // Handle 401 Unauthorized globally
      if (error.response.status === 401 && typeof window !== "undefined") {
        window.dispatchEvent(new Event("unauthorized_api_call"));
      }
    } else if (error.request) {
      if (shouldLogError) {
        console.error("[AXIOS] No response received from server");
      }
    } else {
      if (shouldLogError) {
        console.error("[AXIOS] Error setting up request");
      }
    }

    return Promise.reject(
      (error.response && error.response.data) ||
      error.message ||
      "Something went wrong!"
    );
  }
);

// ----------------------------------------------------------------------

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);

    throw error;
  }
};

// ----------------------------------------------------------------------

export const poster = async (args, data) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  if (!config?.suppressRequestLog) {
    console.log("[POSTER] Called with:", {
      url,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
    });
  }

  try {
    const response = data
      ? await axiosInstance.post(url, data, { ...config })
      : await axiosInstance.post(url, { ...config });

    if (!config?.suppressRequestLog) {
      console.log("[POSTER] Success:", {
        status: response.status,
        data: response.data,
      });
    }
    return response.data;
  } catch (error) {
    if (!config?.suppressErrorLog) {
      console.error("[POSTER] Error:", error);
    }
    throw error;
  }
};
