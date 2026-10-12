import { createSlice } from "@reduxjs/toolkit";

const getItemPrice = (item) => Number(item?.price) || Number(item?.regular_price) || 0;

const calculateLocalSubtotal = (items) =>
  items.reduce((total, item) => total + getItemPrice(item) * (Number(item?.quantity) || 0), 0);

const applyLocalTotals = (state) => {
  state.subtotal = calculateLocalSubtotal(state.items);
  state.discount.amount = 0;
  state.shipping = 0;
  state.total = state.subtotal;
};

const normalizeDiscountFromCalculation = (calculation) => {
  const discountCodeRaw = calculation?.discount_code;
  const code =
    typeof discountCodeRaw === "string"
      ? discountCodeRaw
      : typeof discountCodeRaw?.code === "string"
        ? discountCodeRaw.code
        : "";

  return {
    appliesTo:
      discountCodeRaw?.applies_to ||
      calculation?.discount_info?.applies_to ||
      "",
    targetId:
      discountCodeRaw?.target ||
      calculation?.discount_info?.target?.id ||
      "",
    code,
    type:
      discountCodeRaw?.type ||
      calculation?.discount_info?.type ||
      "",
    value:
      Number(discountCodeRaw?.value) ||
      Number(calculation?.discount_info?.value) ||
      0,
    amount:
      Number(calculation?.discount?.amount) ||
      Number(discountCodeRaw?.calculated_amount) ||
      0,
  };
};

const initialState = {
  isLoading: false,
  items: [],
  subtotal: 0,
  total: 0,
  discount: {
    appliesTo: "",
    targetId: "",
    code: "",
    type: "",
    value: 0,
    amount: 0,
  },
  shipping: 0,
  totalItems: 0,
  activeStep: 0,
  calculation: null,
  errorMessage: "",
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    changeActiveStep: (state, action) => {
      state.activeStep = action.payload;
    },

    getCartDataRequest: (state) => {
      state.isLoading = true;
      state.errorMessage = "";
    },

    getCartDataSuccess: (state, action) => {
      state.isLoading = false;
      
      const incomingItems = Array.isArray(action.payload) ? action.payload : [];
      
      // Preserve frontend-only customization properties from existing state
      state.items = incomingItems.map((newItem) => {
        const existingItem = state.items.find((oldItem) => {
          const oldId = String(oldItem.cart_id || oldItem.id || "old_none");
          const newId = String(newItem.cart_id || newItem.id || "new_none");
          if (oldId === newId && oldId !== "old_none") return true;
          
          const getDefinitiveId = (item) => {
             const type = item.itemable_type || item.product_type || "Product";
             if (type === "ProductVariant") {
                 return String(item.variant_id || item.itemable_id || item.product_id || "");
             }
             return String(item.itemable_id || item.product_id || "");
          };
          
          const isSameProduct = getDefinitiveId(oldItem) === getDefinitiveId(newItem) && getDefinitiveId(oldItem) !== "";
          
          const oldCustomId = String(oldItem.customization?.design_combination_id || oldItem.design_combination_id || "");
          const newCustomId = String(newItem.customization?.design_combination_id || newItem.design_combination_id || "");
          const isSameCustom = (!oldCustomId || !newCustomId) ? true : (oldCustomId === newCustomId);
          
          return isSameProduct && isSameCustom;
        });

        if (existingItem) {
          return {
            ...newItem,
            tshirtFrontImage: existingItem.tshirtFrontImage || newItem.tshirtFrontImage,
            frontDesign: existingItem.frontDesign || newItem.frontDesign,
            backDesign: existingItem.backDesign || newItem.backDesign,
            color: existingItem.color || newItem.color,
          };
        }
        
        return newItem;
      });

      state.totalItems = state.items.length;

      if (state.items.length === 0) {
        state.calculation = null;
        applyLocalTotals(state);
        return;
      }

      if (!state.calculation) {
        applyLocalTotals(state);
      }
    },

    getCartDataFailure: (state, action) => {
      state.isLoading = false;
      state.errorMessage = action.payload || "";
    },

    setCartCalculation: (state, action) => {
      const calculation = action.payload;

      if (!calculation || typeof calculation !== "object") {
        state.calculation = null;
        applyLocalTotals(state);
        return;
      }

      state.calculation = calculation;
      state.subtotal = Number(calculation.subtotal) || 0;
      state.shipping =
        Number(calculation.additional_charges_total) ||
        Number(calculation.logistic_charge) ||
        0;
      state.discount = normalizeDiscountFromCalculation(calculation);
      state.total = Number(calculation.total_amount) || 0;
    },

    clearCartCalculation: (state) => {
      state.calculation = null;
      state.discount = {
        appliesTo: "",
        targetId: "",
        code: "",
        type: "",
        value: 0,
        amount: 0,
      };
      applyLocalTotals(state);
    },

    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(
        (item) => String(item.product_id) === String(newItem.product_id),
      );

      if (existingItem) {
        existingItem.quantity += Number(newItem.quantity) || 1;
      } else {
        state.items.push(newItem);
      }

      state.totalItems = state.items.length;
      state.calculation = null;
      applyLocalTotals(state);
    },

    removeCartItem: (state, action) => {
      const cartId = action.payload;
      state.items = state.items.filter((item) => item.cart_id != cartId);
      state.totalItems = state.items.length;
      state.calculation = null;
      applyLocalTotals(state);
    },

    changeItemQuantity: (state, action) => {
      const { cartId, quantity } = action.payload;
      const item = state.items.find((cartItem) => cartItem.cart_id == cartId);

      if (item) {
        item.quantity = Number(quantity) || 1;
      }

      state.totalItems = state.items.length;
      state.calculation = null;
      applyLocalTotals(state);
    },

    setShippingCharge: (state, action) => {
      state.calculation = null;
      state.shipping = Number(action.payload) || 0;
      state.total = state.subtotal - state.discount.amount + state.shipping;
    },

    setDiscount: (state, action) => {
      const payload = action.payload || {};
      const amount =
        Number(payload?.discount?.amount) ||
        Number(payload?.discount_code?.calculated_amount) ||
        Number(payload?.amount) ||
        0;

      state.discount = {
        appliesTo: payload?.discount_code?.applies_to || payload?.applies_to || "",
        targetId: payload?.discount_code?.target || payload?.target_id || "",
        code:
          payload?.discount_code?.code ||
          (typeof payload?.discount_code === "string" ? payload.discount_code : ""),
        type: payload?.discount_code?.type || payload?.discount_type || "",
        value: Number(payload?.discount_code?.value) || Number(payload?.discount_value) || 0,
        amount,
      };

      state.total = state.subtotal - amount + state.shipping;
    },

    removeDiscount: (state) => {
      state.discount = {
        appliesTo: "",
        targetId: "",
        code: "",
        type: "",
        value: 0,
        amount: 0,
      };

      if (state.calculation) {
        state.calculation = null;
      }

      state.total = state.subtotal + state.shipping;
    },

    resetCart: (state) => {
      Object.assign(state, initialState);
    },

    changeStep: (state, action) => {
      state.activeStep = action.payload;
    },
  },
});
