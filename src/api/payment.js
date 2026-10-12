import { endpoints } from "./endpoints";
import { normalizeApiError, normalizeEnvelope } from "./response-envelope";

import { fetcher, poster as clientPoster } from "@/lib/axios-client";

export const initiateEsewaPayment = async (orderId, body = {}, config = {}) => {
  try {
    if (!orderId) {
      throw normalizeApiError(
        {
          status: 422,
          message: "Validation failed",
          data: { order_id: ["Order id is required."] },
        },
        "Validation failed",
      );
    }

    const response = await clientPoster([endpoints.payment.esewa(orderId), config], body);
    return normalizeEnvelope(response, "Initiated eSewa Payment.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

// Backend only accepts GET for these callback routes.
// We forward the query params eSewa sent us as a query string.

export const verifyEsewaSuccess = async (params) => {
  try {
    const qs = new URLSearchParams(params).toString();
    const url = `${endpoints.payment.esewaSuccess}?${qs}`;
    const response = await fetcher(url);
    return normalizeEnvelope(response, "Payment verified.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const verifyEsewaFailure = async (params) => {
  try {
    const qs = new URLSearchParams(params).toString();
    const url = `${endpoints.payment.esewaFailure}?${qs}`;
    const response = await fetcher(url);
    return normalizeEnvelope(response, "Payment failure reported.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const initiateFonepayPayment = async (orderId, body = {}, config = {}) => {
  try {
    if (!orderId) {
      throw normalizeApiError(
        {
          status: 422,
          message: "Validation failed",
          data: { order_id: ["Order id is required."] },
        },
        "Validation failed",
      );
    }

    const response = await clientPoster([endpoints.payment.fonepay(orderId), config], body);
    return normalizeEnvelope(response, "Initiated Fonepay Payment.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const checkFonepayStatus = async (prn, body = {}, config = {}) => {
  try {
    if (!prn) {
      throw normalizeApiError(
        {
          status: 422,
          message: "Validation failed",
          data: { prn: ["PRN is required."] },
        },
        "Validation failed",
      );
    }

    const response = await clientPoster([endpoints.payment.fonepayStatus(prn), config], body);
    return normalizeEnvelope(response, "Fonepay status checked.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};
