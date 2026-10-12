import { profileSlice } from "../reducer/profile/profile-slice";

export const {
  getProfileRequest,
  getProfileSuccess,
  getProfileFailure,
  setProfileAddresses,
  updateProfile,
  resetProfile,
} = profileSlice.actions;
