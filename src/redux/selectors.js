export const selectAuthState = (state) => state.auth;

export const selectProductState = (state) => state.product;

export const selectWishlistState = (state) => state.wishlist;

export const selectCartState = (state) => state.cart;

export const selectCartItems = (state) => state.cart?.items || [];
