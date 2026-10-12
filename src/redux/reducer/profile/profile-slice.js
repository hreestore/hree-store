import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  profile: {},
  addresses: [],
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    getProfileRequest: (state) => {
      state.isLoading = true;
    },

    getProfileSuccess: (state, action) => {
      state.isLoading = false;

      state.profile = action.payload;

      state.addresses = action.payload.addresses;
    },

    getProfileFailure: (state) => {
      state.isLoading = false;
    },

    setProfileAddresses: (state, action) => {
      state.addresses = action.payload;
    },

    updateProfile: (state, action) => {
      state.profile = action.payload;

      state.addresses = action.payload.addresses;
    },

    resetProfile: (state) => {
      state.isLoading = false;

      state.profile = {};

      state.addresses = [];
    },
  },
});
