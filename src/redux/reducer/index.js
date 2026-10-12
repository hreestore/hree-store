import { combineSlices } from "@reduxjs/toolkit";

import { authSlice } from "./auth/auth-slice";
import { cartSlice } from "./cart/cart-slice";
import { profileSlice } from "./profile/profile-slice";
import { wishlistSlice } from "./wishlist/wishlist-slice";
import { productSlice } from "./product/product-slice";
import { productFilterSlice } from "./product-filter/product-filter-slice";
import { vendorSlice } from "./vendor/vendor-slice";
import { chatSlice } from "./chat/chat-slice";

export const rootReducer = combineSlices(
  authSlice,
  cartSlice,
  profileSlice,
  wishlistSlice,
  productSlice,
  productFilterSlice,
  vendorSlice,
  chatSlice
);
