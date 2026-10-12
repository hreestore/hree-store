import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  category: "",
  brand: [],
};

export const productFilterSlice = createSlice({
  name: "productFilter",
  initialState,
  reducers: {
    setBrand: (state, action) => {
      state.brand = action.payload;
    },

    setCategory: (state, action) => {
      state.category = action.payload;
    },

    setName: (state, action) => {
      state.name = action.payload;
    },
  },
});
