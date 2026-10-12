import { call, put, takeLatest, select } from "redux-saga/effects";

import {
  getVendorDetailRequest,
  getVendorDetailSuccess,
  getVendorDetailFailure,
  resetCart,
  clearWishlist,
  resetProfile,
} from "../actions";

import { getVendorDetails } from "@/api";

function* fetchVendorSaga() {
  try {
    const currentVendor = yield select((state) => state.vendor.vendor);
    const response = yield call(getVendorDetails);

    if (
      currentVendor && 
      currentVendor.id && 
      response && 
      response.id && 
      String(currentVendor.id) !== String(response.id)
    ) {
      yield put(resetCart());
      yield put(clearWishlist());
      yield put(resetProfile());
    }

    yield put(getVendorDetailSuccess(response));
  } catch (error) {
    yield put(getVendorDetailFailure());
  }
}

export function* watchVendorSaga() {
  yield takeLatest(getVendorDetailRequest, fetchVendorSaga);
}
