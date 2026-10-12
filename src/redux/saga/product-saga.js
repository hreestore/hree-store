import { call, put, takeLatest } from "redux-saga/effects";

import {
  getProductReviewsRequest,
  getProductReviewsSuccess,
  getProductReviewsFailure,
} from "../actions";

import { getProductReviews } from "@/api";

function* fetchProductReviewsSaga({ payload }) {
  try {
    const response = yield call(getProductReviews, payload);

    yield put(getProductReviewsSuccess(response));
  } catch (error) {
    yield put(getProductReviewsFailure());
  }
}

export function* watchProductSaga() {
  yield takeLatest(getProductReviewsRequest, fetchProductReviewsSaga);
}
