import { call, put, takeLatest } from "redux-saga/effects";

import {
  getProfileRequest,
  getProfileSuccess,
  getProfileFailure,
} from "../actions";

import { getProfile } from "@/api";

function* fetchProfileSaga() {
  try {
    const response = yield call(getProfile);

    yield put(getProfileSuccess(response[0]));
  } catch (error) {
    yield put(getProfileFailure());
  }
}

export function* watchProfileSaga() {
  yield takeLatest(getProfileRequest, fetchProfileSaga);
}
