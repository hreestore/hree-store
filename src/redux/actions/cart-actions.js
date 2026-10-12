import { cartSlice } from "../reducer/cart/cart-slice";

export const {
  changeActiveStep,
  getCartDataRequest,
  getCartDataSuccess,
  getCartDataFailure,
  addToCart,
  removeCartItem,
  changeItemQuantity,
  resetCart,
  setShippingCharge,
  setDiscount,
  removeDiscount,
  setCartCalculation,
  clearCartCalculation,
} = cartSlice.actions;
