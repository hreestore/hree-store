import { endpoints } from "./endpoints";

import { fetcher, poster } from "@/lib/axios-client";

import { normalizeApiError, normalizeEnvelope } from "./response-envelope";

const ALLOWED_PRODUCT_TYPES = new Set(["Product", "ProductVariant"]);

const toPositiveQuantity = (value) => {
  const quantity = Number.parseInt(value, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: { quantity: ["Quantity must be at least 1."] },
      },
      "Validation failed",
    );
  }
  return quantity;
};

const normalizeCustomizationInput = (item) => {
  const customizationRaw = Array.isArray(item.customization)
    ? item.customization[0]
    : item.customization;

  const designCombinationId =
    customizationRaw?.design_combination_id ?? item.design_combination_id;
  const designIds = customizationRaw?.design_ids ?? item.design_ids;
  const swappedCombinationRaw =
    customizationRaw?.swapped_combination ?? item.swapped_combination;
  const swappedCombination =
    typeof swappedCombinationRaw === "boolean" ? swappedCombinationRaw : undefined;

  const hasCustomizationData =
    designCombinationId !== undefined ||
    (Array.isArray(designIds) && designIds.length > 0);

  return {
    hasCustomizationData,
    swappedCombination,
    customization: hasCustomizationData
      ? {
          ...(designCombinationId !== undefined && {
            design_combination_id: Number(designCombinationId),
          }),
          ...(Array.isArray(designIds) && {
            design_ids: designIds.map((id) => Number(id)),
          }),
          ...(swappedCombination !== undefined && {
            swapped_combination: swappedCombination,
          }),
        }
      : undefined,
  };
};

const normalizeProductType = (item) => {
  const productType =
    item.product_type ||
    (item.variant_id ? "ProductVariant" : "Product");

  if (!ALLOWED_PRODUCT_TYPES.has(productType)) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: {
          product_type: ["Product type must be Product or ProductVariant."],
        },
      },
      "Validation failed",
    );
  }

  return productType;
};

const normalizeProductId = (item, productType) => {
  const candidate =
    (productType === "ProductVariant" ? item.variant_id : undefined) ??
    item.product_id ??
    item.itemable_id;

  const productId = Number(candidate);
  if (!Number.isFinite(productId) || productId <= 0) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: {
          product_id: ["Product id is required."],
        },
      },
      "Validation failed",
    );
  }

  return productId;
};

const normalizeCartItemPayload = (item, { requireQuantity = true } = {}) => {
  const productType = normalizeProductType(item);
  const productId = normalizeProductId(item, productType);
  const { hasCustomizationData, customization, swappedCombination } =
    normalizeCustomizationInput(item);
  const hasIsCustomizedFlag = typeof item.is_customized === "boolean";
  const isCustomized = hasIsCustomizedFlag ? item.is_customized : hasCustomizationData;

  if (isCustomized && !hasCustomizationData) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: {
          customization: ["Customization payload is required when is_customized is true."],
        },
      },
      "Validation failed",
    );
  }

  if (!isCustomized && hasCustomizationData) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: {
          customization: ["Do not send customization payload when is_customized is false."],
        },
      },
      "Validation failed",
    );
  }

  return {
    product_type: productType,
    product_id: productId,
    ...(requireQuantity && { quantity: toPositiveQuantity(item.quantity ?? 1) }),
    ...(hasIsCustomizedFlag || hasCustomizationData ? { is_customized: isCustomized } : {}),
    ...(isCustomized && customization ? { customization } : {}),
    ...(isCustomized && swappedCombination !== undefined
      ? { swapped_combination: swappedCombination }
      : {}),
  };
};

const normalizeUpdatePayload = (payload) => {
  const item = payload || {};
  const base = {
    quantity: toPositiveQuantity(item.quantity),
  };

  const hasCustomizationInput =
    "is_customized" in item ||
    item.customization !== undefined ||
    item.design_combination_id !== undefined ||
    item.design_ids !== undefined ||
    item.swapped_combination !== undefined;

  if (!hasCustomizationInput) {
    return base;
  }

  const { hasCustomizationData, customization, swappedCombination } =
    normalizeCustomizationInput(item);
  const isCustomized =
    typeof item.is_customized === "boolean"
      ? item.is_customized
      : hasCustomizationData;

  if (isCustomized && !hasCustomizationData) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: {
          customization: ["Customization payload is required when is_customized is true."],
        },
      },
      "Validation failed",
    );
  }

  if (!isCustomized && hasCustomizationData) {
    throw normalizeApiError(
      {
        status: 422,
        message: "Validation failed",
        data: {
          customization: ["Do not send customization payload when is_customized is false."],
        },
      },
      "Validation failed",
    );
  }

  return {
    ...base,
    is_customized: isCustomized,
    ...(isCustomized && customization ? { customization } : {}),
    ...(isCustomized && swappedCombination !== undefined
      ? { swapped_combination: swappedCombination }
      : {}),
  };
};

export const getCartData = async () => {
  try {
    const response = await fetcher(endpoints.cart.getProducts);
    return normalizeEnvelope(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const addProductToCart = async (product, token = null) => {
  try {
    const productArray = Array.isArray(product) ? product : [product];
    const payloadItems = productArray.map((item) =>
      normalizeCartItemPayload(item, { requireQuantity: true }),
    );
    const payload = payloadItems.length === 1 ? payloadItems[0] : payloadItems;

    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await poster(
      token ? [endpoints.cart.addProduct, config] : endpoints.cart.addProduct,
      payload,
    );

    return normalizeEnvelope(response, "Cart updated.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateProductInCart = async ({
  cartId,
  quantity,
  is_customized,
  customization,
  design_combination_id,
  design_ids,
  swapped_combination,
}) => {
  try {
    const payload = normalizeUpdatePayload({
      quantity,
      is_customized,
      customization,
      design_combination_id,
      design_ids,
      swapped_combination,
    });

    const response = await poster(endpoints.cart.updateProduct(cartId), payload);

    return normalizeEnvelope(response, "Cart item updated.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const removeProductFromCart = async (cartId) => {
  try {
    const response = await poster(endpoints.cart.removeProduct(cartId));
    return normalizeEnvelope(response, "Cart item removed.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const clearCartData = async () => {
  try {
    const response = await poster(endpoints.cart.clearProducts);
    return normalizeEnvelope(response, "Cart cleared.");
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const validateCartCustomization = async (payload) => {
  try {
    const normalizedPayload = normalizeCartItemPayload(payload, {
      requireQuantity: false,
    });
    const response = await poster(
      [
        endpoints.cart.validate,
        {
          suppressErrorLog: true,
          suppressRequestLog: true,
        },
      ],
      normalizedPayload,
    );
    return normalizeEnvelope(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const checkDiscount = async (data = {}) => {
  try {
    const response = await poster(endpoints.cart.checkDiscount, data);
    return normalizeEnvelope(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const calculateCart = async (data = {}) => {
  try {
    const response = await poster(endpoints.cart.calculate, data);
    return normalizeEnvelope(response);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const syncCartToServer = async (items, token = null) => {
  const cartItems = items.map((item) =>
    normalizeCartItemPayload(item, { requireQuantity: true }),
  );

  try {
    return await addProductToCart(cartItems, token);
  } catch (error) {
    throw normalizeApiError(error);
  }
};
