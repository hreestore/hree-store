import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  items: [],
  totalItems: 0,
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    getWishlistRequest: (state) => {
      state.isLoading = true;
    },

    getWishlistSuccess: (state, action) => {
      state.isLoading = false;

      state.items = action.payload;

      state.totalItems = state.items.length;
    },

    getWishlistFailure: (state) => {
      state.isLoading = false;
    },

    addToWishlist: (state, action) => {
      const newItem = action.payload;

      state.items.push(newItem);

      state.totalItems = state.items.length;
    },

    removeWishlistItem: (state, action) => {
      const wishlistId = action.payload;

      state.items = state.items.filter(
        (item) => item.wishlist_id !== wishlistId
      );

      state.totalItems = state.items.length;
    },

    clearWishlist: (state) => {
      state.isLoading = false;
      state.items = [];
      state.totalItems = 0;
    },
  },
});
