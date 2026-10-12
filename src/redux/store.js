import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from "redux-persist";
import { PERSIST, REHYDRATE, REGISTER } from "redux-persist";

import { rootReducer } from "./reducer";

import { rootSaga } from "./saga";

import storage from "./storage";
import { PERSIST_KEY } from "./persist-key";

const persistConfig = {
  key: PERSIST_KEY,
  storage,
  whitelist: ["auth", "cart", "vendor", "profile"],
  blacklist: ["wishlist"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [PERSIST, REHYDRATE, REGISTER],
        },
      }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  const persistor = typeof window !== "undefined" ? persistStore(store) : null;

  return { store, persistor };
};
