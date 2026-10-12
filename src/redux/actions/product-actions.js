import { productSlice } from "../reducer/product/product-slice";

export const {
  getProductReviewsRequest,
  getProductReviewsSuccess,
  getProductReviewsFailure,
  addProductReview,
} = productSlice.actions;
