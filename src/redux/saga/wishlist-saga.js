import { call, put, takeLatest } from "redux-saga/effects";

import {
  getWishlistRequest,
  getWishlistSuccess,
  getWishlistFailure,
} from "../actions";

import { getWishlistData } from "@/api";

function* fetchWishlistSaga() {
  try {
    const response = yield call(getWishlistData);

    // Only update wishlist if response is valid and is an array
    if (Array.isArray(response)) {
      yield put(getWishlistSuccess(response));
    } else {
      // Clear wishlist if response is invalid
      yield put(getWishlistSuccess([]));
    }
  } catch (error) {
    // Clear wishlist on error instead of keeping old data
    yield put(getWishlistSuccess([]));
    yield put(getWishlistFailure());
  }
}

export function* watchWishlistSaga() {
  yield takeLatest(getWishlistRequest, fetchWishlistSaga);
}
