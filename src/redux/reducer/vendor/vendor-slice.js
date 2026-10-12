import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  vendor: {},
};

export const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    getVendorDetailRequest: (state) => {
      state.isLoading = true;
    },

    getVendorDetailSuccess: (state, action) => {
      state.isLoading = false;

      state.vendor = action.payload;
    },

    getVendorDetailFailure: (state) => {
      state.isLoading = false;
    },
  },
});
