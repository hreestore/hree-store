import { endpoints } from "./endpoints";

import { poster as serverPoster } from "@/lib/axios-server";

/**
 * Submit quick order - handles both new and existing customers
 * @param {Object} orderData - Order data including customer info and items
 * @returns {Promise<Object>} Response with order or OTP requirement
 */
export const submitQuickOrder = async (orderData) => {
    try {
        const response = await serverPoster(endpoints.quickOrder.store, orderData);

        // Response can be either:
        // 1. Order created (new customer) with token
        // 2. OTP required (existing customer)

        if (response.success) {
            return response;
        }

        throw response;
    } catch (error) {
        throw error;
    }
};

/**
 * Verify OTP and create order for existing customers
 * @param {Object} data - OTP code, email, and order data
 * @returns {Promise<Object>} Response with order and token
 */
export const verifyOtpAndCreateOrder = async (data) => {
    try {
        const response = await serverPoster(endpoints.quickOrder.verifyAndCreate, data);

        // Returns { success, message, data: { order, customer, token, token_type } }
        if (response.success && response.data) {
            return response;
        }

        throw response;
    } catch (error) {
        throw error;
    }
};
