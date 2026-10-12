import { call, put, takeLatest } from "redux-saga/effects";

import { getChatRequest, getChatSuccess, getChatFailure } from "../actions";

import { getChat } from "@/api";

function* fetchChatSaga() {
  try {
    const response = yield call(getChat);

    yield put(getChatSuccess(response));
  } catch (error) {
    yield put(getChatFailure());
  }
}

export function* watchChatSaga() {
  yield takeLatest(getChatRequest, fetchChatSaga);
}
