import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  reviews: [],
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    getProductReviewsRequest: (state) => {
      state.isLoading = true;

      state.reviews = [];
    },

    getProductReviewsSuccess: (state, action) => {
      state.isLoading = false;

      state.reviews = action.payload;
    },

    getProductReviewsFailure: (state) => {
      state.isLoading = false;
    },

    addProductReview: (state, action) => {
      state.reviews.push(action.payload);
    },
  },
});
