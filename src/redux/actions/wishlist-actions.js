import { wishlistSlice } from "../reducer/wishlist/wishlist-slice";

export const {
  getWishlistRequest,
  getWishlistSuccess,
  getWishlistFailure,
  addToWishlist,
  removeWishlistItem,
  clearWishlist,
} = wishlistSlice.actions;
