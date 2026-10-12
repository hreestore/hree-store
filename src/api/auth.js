import { endpoints } from "./endpoints";

import { poster as clientPoster } from "@/lib/axios-client";

import { poster as serverPoster } from "@/lib/axios-server";

export const signUp = async (userData) => {
  try {
    const response = await serverPoster(endpoints.auth.signUp, userData);

    // According to docs: Registration returns { success, message, data: { customer, token, token_type } }
    if (response.success && response.data) {
      return {
        success: true,
        message: response.message,
        customer: response.data.customer,
        token: response.data.token,
        token_type: response.data.token_type,
      };
    }

    throw response;
  } catch (error) {
    // Handle validation errors from response.data
    if (error?.data) {
      throw error.data;
    }
    throw error;
  }
};

export const signIn = async (userData) => {
  try {
    const response = await serverPoster(endpoints.auth.signIn, userData);

    // The API returns { customer, token, token_type } directly
    if (response?.token && response?.customer) {
      return {
        token: response.token,
        token_type: response.token_type || "Bearer",
        customer: response.customer,
      };
    }

    throw new Error("Invalid response structure from server");
  } catch (error) {
    // Handle specific error cases from documentation
    throw error;
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await serverPoster(endpoints.auth.resendVerification, {
      email,
    });

    if (response.success) {
      return response;
    }

    throw response;
  } catch (error) {
    throw error;
  }
};

export const googleExchange = async (code) => {
  try {
    const response = await clientPoster(endpoints.auth.googleExchange, {
      code,
    });

    // Returns { success, message, data: { customer, token, token_type } }
    if (response.success && response.data) {
      return {
        success: true,
        message: response.message,
        customer: response.data.customer,
        token: response.data.token,
        token_type: response.data.token_type,
      };
    }

    throw response;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    const response = await clientPoster(endpoints.auth.signOut);

    return response;
  } catch (error) {
    throw error;
  }
};

export const requestOtp = async (email) => {
  try {
    const response = await serverPoster(endpoints.auth.requestOtp, { email });

    if (response.success) {
      return response;
    }

    throw response;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await serverPoster(endpoints.auth.verifyOtp, {
      email,
      otp_code: otp,
    });

    // Returns { success, message, data: { customer, token, token_type } }
    if (response.success && response.data) {
      return {
        success: true,
        message: response.message,
        customer: response.data.customer,
        token: response.data.token,
        token_type: response.data.token_type,
      };
    }

    throw response;
  } catch (error) {
    throw error;
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await serverPoster(endpoints.auth.resendOtp, { email });

    if (response.success) {
      return response;
    }

    throw response;
  } catch (error) {
    throw error;
  }
};
