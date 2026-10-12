"use client";

import useSWR from "swr";
import { useSWRConfig } from "swr";

import { endpoints } from "./endpoints";
import { normalizeApiError, normalizeEnvelope } from "./response-envelope";

import { fetcher, poster as clientPoster } from "@/lib/axios-client";
import { poster as serverPoster } from "@/lib/axios-server";

export const useGetOrders = () => {
  const { data, error, isLoading } = useSWR(endpoints.order.list, fetcher);

  return {
    orders: data?.data?.orders || [],
    emailVerified: data?.data?.email_verified || false,
    hasHiddenOrders: data?.data?.has_hidden_orders || false,
    hiddenOrdersCount: data?.data?.hidden_orders_count || 0,
    visibleOrdersCount: data?.data?.visible_orders_count || 0,
    message: data?.data?.message,
    error,
    isLoading,
  };
};

export const useGetMutateOrders = () => {
  const { mutate } = useSWRConfig();
  return () => mutate(endpoints.order.list);
};

export const useGetOrderDetail = (id) => {
  const { data, error, isLoading } = useSWR(endpoints.order.details(id), fetcher);

  return {
    order: data?.data || {},
    error,
    isLoading,
  };
};

export const useGetMutateOrderDetail = (id) => {
  const { mutate } = useSWRConfig();
  return () => mutate(endpoints.order.details(id));
};

export const createOrder = async (cartData) => {
  try {
    const response = await clientPoster(endpoints.order.create, cartData);
    return normalizeEnvelope(response, "Order created successfully.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const createQuickOrder = async (data) => {
  try {
    const response = await serverPoster(endpoints.quickOrder.store, data);
    return normalizeEnvelope(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateOrderStatus = async (orderData) => {
  try {
    const orderId = orderData?.order_id || orderData?.id;
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

    const { id, order_id, customer_address_id, status, remarks } = orderData || {};
    const payload = {
      ...(customer_address_id && {
        customer_address_id: Number.parseInt(customer_address_id, 10),
      }),
      ...(typeof status === "string" && ["cancelled", "returned"].includes(status)
        ? { status }
        : {}),
      ...(typeof remarks === "string" && remarks.trim() ? { remarks: remarks.trim() } : {}),
    };

    const response = await clientPoster(endpoints.order.update(orderId), payload);
    return normalizeEnvelope(response, "Order updated successfully.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateOrderAddress = async (orderData) => updateOrderStatus(orderData);
