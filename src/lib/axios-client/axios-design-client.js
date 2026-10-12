import { CONFIG } from "@/global-config";
import axios from "axios";
import { PERSIST_STORAGE_KEY } from "@/redux/persist-key";


// ----------------------------------------------------------------------


const axiosDesignInstance = axios.create({
    baseURL: CONFIG.designUrl,
});

axiosDesignInstance.interceptors.request.use(
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

        return config;
    },
    (error) => Promise.reject(error)
);

axiosDesignInstance.interceptors.response.use(
    (response) => {
        // console.log("[AXIOS] Response:", {
        //   status: response.status,
        //   url: response.config.url,
        // });
        return response;
    },
    (error) => {
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

        if (error.response) {
            console.error("[AXIOS] Server responded with error");
        } else if (error.request) {
            console.error("[AXIOS] No response received from server");
        } else {
            console.error("[AXIOS] Error setting up request");
        }

        return Promise.reject(
            (error.response && error.response.data) ||
            error.message ||
            "Something went wrong!"
        );
    }
);

// ----------------------------------------------------------------------

export default axiosDesignInstance;

// ----------------------------------------------------------------------


export const designFetcher = async (args) => {
    try {
        const [url, config] = Array.isArray(args) ? args : [args];

        const res = await axiosDesignInstance.get(url, { ...config });

        return res.data;
    } catch (error) {
        console.error("Failed to fetch:", error);

        throw error;
    }
};
export const sizeCatalogueFetcher = async (args) => {
    try {
        const [url, config] = Array.isArray(args) ? args : [args];

        const res = await axiosDesignInstance.get(url, { ...config });

        return res.data;
    } catch (error) {
        console.error("Failed to fetch:", error);

        throw error;
    }
};


