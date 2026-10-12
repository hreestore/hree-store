import { all } from "redux-saga/effects";

import { watchCartSaga } from "./cart-saga";
import { watchProfileSaga } from "./profile-saga";
import { watchProductSaga } from "./product-saga";
import { watchWishlistSaga } from "./wishlist-saga";
import { watchVendorSaga } from "./vendor-saga";
import { watchChatSaga } from "./chat-saga";

export function* rootSaga() {
  yield all([
    watchCartSaga(),
    watchProfileSaga(),
    watchProductSaga(),
    watchWishlistSaga(),
    watchVendorSaga(),
    watchChatSaga(),
  ]);
}
