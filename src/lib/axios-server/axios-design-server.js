import axios from "axios";

import { CONFIG } from "@/global-config";

// ----------------------------------------------------------------------

const axiosDesignServerInstance = axios.create({
    baseURL: CONFIG.designUrl,
});

axiosDesignServerInstance.interceptors.request.use(
    (config) => {
        config.headers["Vendor"] = CONFIG.vendorToken;

        return config;
    },
    (error) => Promise.reject(error)
);

axiosDesignServerInstance.interceptors.response.use(
    (response) => response,
    (error) =>
        Promise.reject(
            (error.response && error.response.data) || "Something went wrong!"
        )
);

// ----------------------------------------------------------------------

export default axiosDesignServerInstance;

// ----------------------------------------------------------------------

export const designFetcher = async (args) => {
    try {
        const [url, config] = Array.isArray(args) ? args : [args];

        const res = await axiosDesignServerInstance.get(url, { ...config });

        return res.data;
    } catch (error) {
        // Re-throw without logging - let the caller handle error logging
        throw error;
    }
};

export const sizeCatalogueFetcher = async (args) => {
    try {
        const [url, config] = Array.isArray(args) ? args : [args];

        const res = await axiosDesignServerInstance.get(url, { ...config });

        return res.data;
    } catch (error) {
        // Re-throw without logging - let the caller handle error logging
        throw error;
    }
};

