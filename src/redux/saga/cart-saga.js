import { call, put, takeLatest, select } from "redux-saga/effects";

import {
  getCartDataRequest,
  getCartDataSuccess,
  getCartDataFailure,
  setCartCalculation,
  clearCartCalculation,
} from "../actions";

import { calculateCart, getCartData } from "@/api";

function* fetchCartSaga() {
  try {
    const { isLogin, userToken } = yield select((state) => state.auth);
    if (!isLogin || !userToken) {
      yield put(getCartDataFailure(""));
      return;
    }

    const response = yield call(getCartData);
    const isSuccess = response?.success !== false;
    const cartItems = Array.isArray(response?.data) ? response.data : [];

    if (!isSuccess) {
      throw response;
    }

    yield put(getCartDataSuccess(cartItems));

    if (cartItems.length === 0) {
      yield put(clearCartCalculation());
      return;
    }

    try {
      const calculationResponse = yield call(calculateCart, {});
      if (calculationResponse?.success && calculationResponse?.data) {
        yield put(setCartCalculation(calculationResponse.data));
      } else {
        yield put(clearCartCalculation());
      }
    } catch (calcError) {
      console.warn("Cart calculation failed on fetch:", calcError);
      yield put(clearCartCalculation());
    }
  } catch (error) {
    yield put(getCartDataFailure(error?.message || "Failed to load cart."));
  }
}

export function* watchCartSaga() {
  yield takeLatest(getCartDataRequest, fetchCartSaga);
}
